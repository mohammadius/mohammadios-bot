declare global {
	namespace NodeJS {
		interface ProcessEnv {
			BOT_TOKEN: string;
			SPOTIFY_ID: string;
			SPOTIFY_SECRET: string;
			SEQ_KEY: string;
		}
	}
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
