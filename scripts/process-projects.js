import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectsDir = path.join(__dirname, '../src/projects');
const publicAssetsDir = path.join(__dirname, '../public/project-assets');

// Supported image extensions
const imageExtensions = ['.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp'];

function processProjects() {
    // Clean and create public assets directory
    if (fs.existsSync(publicAssetsDir)) {
        fs.rmSync(publicAssetsDir, { recursive: true });
    }
    fs.mkdirSync(publicAssetsDir, { recursive: true });

    // Get all project folders
    const projects = fs.readdirSync(projectsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    projects.forEach(projectName => {
        const projectPath = path.join(projectsDir, projectName);
        const projectAssetsDir = path.join(publicAssetsDir, projectName);

        // Create project assets directory
        fs.mkdirSync(projectAssetsDir, { recursive: true });

        // Get all files in project directory
        const files = fs.readdirSync(projectPath);

        // Copy all image files from project root to public assets
        const imageFiles = files.filter(file =>
            imageExtensions.includes(path.extname(file).toLowerCase())
        );

        imageFiles.forEach(file => {
            const srcPath = path.join(projectPath, file);
            const destPath = path.join(projectAssetsDir, file);
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied: ${projectName}/${file}`);
        });
    });
}

processProjects();