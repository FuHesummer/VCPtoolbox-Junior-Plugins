const express = require('express');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const PLUGIN_ROOT = __dirname;
const SKILL_ROOT = path.join(PLUGIN_ROOT, 'SKILL');
const WORKFLOW_ROOT = path.join(PLUGIN_ROOT, 'WORKFLOW');
const INDEX_FILE = path.join(PLUGIN_ROOT, 'skill-index.txt');

function getRootDir(type) {
    return type === 'workflow' ? WORKFLOW_ROOT : SKILL_ROOT;
}

const router = express.Router();
router.use(express.json());

async function countFiles(dir) {
    try {
        const items = await fs.readdir(dir, { recursive: true, withFileTypes: true });
        return items.filter(i => i.isFile?.() ?? !i.isDirectory()).length;
    } catch { return 0; }
}

async function getSkillInfo(name, root = SKILL_ROOT) {
    const dir = path.join(root, name);
    const skillMd = path.join(dir, 'SKILL.md');
    let description = '', fullContent = '', exists = false;
    try {
        fullContent = await fs.readFile(skillMd, 'utf8');
        exists = true;
        const fmMatch = fullContent.match(/^---\s*\n([\s\S]*?)\n---/);
        if (fmMatch) {
            const descMatch = fmMatch[1].match(/^description:\s*(.+)/m);
            if (descMatch) description = descMatch[1].trim();
        }
        if (!description) {
            const body = fullContent.replace(/^---[\s\S]*?\n---\s*/, '').trim();
            description = body.slice(0, 200);
        }
    } catch { /* SKILL.md missing */ }

    // list subdirectories (references, scripts, templates, etc.)
    let subdirs = [];
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        subdirs = entries.filter(e => e.isDirectory()).map(e => e.name);
    } catch { /* ignore */ }

    const fileCount = await countFiles(dir);
    const stat = exists ? await fs.stat(skillMd) : null;

    return {
        name, hasSkillMd: exists, description, fullContent,
        fileCount, subdirs,
        lastModified: stat ? stat.mtime.toISOString() : null
    };
}

// GET /skills?type=skill|workflow (default: skill)
router.get('/skills', async (req, res) => {
    try {
        const type = req.query.type === 'workflow' ? 'workflow' : 'skill';
        const root = getRootDir(type);
        await fs.mkdir(root, { recursive: true });
        const dirents = await fs.readdir(root, { withFileTypes: true });
        const skills = [];
        for (const d of dirents) {
            if (!d.isDirectory()) continue;
            const info = await getSkillInfo(d.name, root);
            delete info.fullContent;
            info.type = type;
            skills.push(info);
        }
        skills.sort((a, b) => a.name.localeCompare(b.name, 'en'));
        res.json({ success: true, skills, total: skills.length, type });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /skills/:name?type=skill|workflow
router.get('/skills/:name', async (req, res) => {
    try {
        const name = req.params.name;
        const root = getRootDir(req.query.type);
        if (name.includes('..') || name.includes('/') || name.includes('\\')) {
            return res.status(400).json({ success: false, error: 'Invalid name' });
        }
        const info = await getSkillInfo(name, root);
        info.type = req.query.type === 'workflow' ? 'workflow' : 'skill';
        res.json({ success: true, skill: info });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /skills/:name?type=skill|workflow
router.delete('/skills/:name', async (req, res) => {
    try {
        const name = req.params.name;
        const root = getRootDir(req.query.type);
        if (name.includes('..') || name.includes('/') || name.includes('\\')) {
            return res.status(400).json({ success: false, error: 'Invalid name' });
        }
        const dir = path.join(root, name);
        await fs.rm(dir, { recursive: true, force: true });
        res.json({ success: true, deleted: name });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /skills - create new skill/workflow directory with SKILL.md
router.post('/skills', async (req, res) => {
    try {
        const { name, content, type } = req.body;
        const root = getRootDir(type);
        if (!name || typeof name !== 'string' || name.includes('..') || name.includes('/') || name.includes('\\')) {
            return res.status(400).json({ success: false, error: 'Invalid name' });
        }
        const dir = path.join(root, name.trim());
        await fs.mkdir(dir, { recursive: true });
        if (content) {
            await fs.writeFile(path.join(dir, 'SKILL.md'), content, 'utf8');
        }
        res.json({ success: true, created: name.trim() });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PUT /skills/:name?type=skill|workflow
router.put('/skills/:name', async (req, res) => {
    try {
        const name = req.params.name;
        const root = getRootDir(req.query.type || req.body.type);
        if (name.includes('..') || name.includes('/') || name.includes('\\')) {
            return res.status(400).json({ success: false, error: 'Invalid name' });
        }
        const { content } = req.body;
        if (typeof content !== 'string') {
            return res.status(400).json({ success: false, error: 'content is required' });
        }
        const dir = path.join(root, name);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(path.join(dir, 'SKILL.md'), content, 'utf8');
        res.json({ success: true, updated: name });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /index
router.get('/index', async (req, res) => {
    try {
        const content = await fs.readFile(INDEX_FILE, 'utf8');
        res.json({ success: true, content });
    } catch {
        res.json({ success: true, content: '(index not generated yet)' });
    }
});

// POST /rescan
router.post('/rescan', (req, res) => {
    const script = path.join(PLUGIN_ROOT, 'SkillBridge.js');
    execFile('node', [script], { cwd: PLUGIN_ROOT, timeout: 30000 }, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ success: false, error: error.message, stderr });
        }
        res.json({ success: true, output: stdout.slice(0, 500) });
    });
});

module.exports = router;
