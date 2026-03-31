import fs from 'node:fs';
import url from 'node:url';
import path from 'node:path';
import child_process from 'node:child_process';

const commands = {
	'update-shadcn-ui-components': async () => {
		// Script to update shadcn-ui components
		const __filename = url.fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);

		const COMPONENTS_DIR = path.join(__dirname, './components/ui/');

		// Gather a list of all component directories
		const componentDirs = fs
			.readdirSync(COMPONENTS_DIR, { withFileTypes: true })
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => dirent.name)
			.join(' ');

		console.log('📚 Updating shadcn-ui components...');

		// Run the shadcn-ui update command
		child_process.execSync(`npx -y shadcn-svelte@latest add -y -o ${componentDirs}`, {
			stdio: 'inherit',
			cwd: __dirname
		});

		console.log('✨ Successfully updated all shadcn-ui components!');
	}
};

const command = process.argv[2];

if (!command) {
	console.error('Please provide a command');
	console.error('Available commands:', Object.keys(commands).join(', '));
	process.exit(1);
}

if (!(command in commands)) {
	console.error(`Unknown command: ${command}`);
	console.error('Available commands:', Object.keys(commands).join(', '));
	process.exit(1);
}
const commandFn = commands[command as keyof typeof commands];

try {
	await commandFn();
} catch (error) {
	console.error('Error executing command:', error);
	process.exit(1);
}