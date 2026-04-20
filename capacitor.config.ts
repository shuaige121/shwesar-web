import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'com.shwesar.app',
	appName: 'ShweSar',
	webDir: 'build',
	server: {
		androidScheme: 'https'
	}
};

export default config;
