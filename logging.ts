import winston from "npm:winston";
import { SeqTransport } from "npm:@datalust/winston-seq";
import env from "./env.ts";

export const logger = winston.createLogger({
	level: "info",
	format: winston.format.combine(winston.format.errors({ stack: true }), winston.format.json()),
	defaultMeta: {
		application: "MohammadiosBot"
	},
	transports: [
		new winston.transports.Console({
			format: winston.format.simple()
		}),
		new SeqTransport({
			serverUrl: "http://mohammadios.wip.la:5341",
			apiKey: env.SEQ_KEY,
			onError: (e) => {
				console.error(e);
			},
			handleExceptions: true,
			handleRejections: true
		})
	]
});
