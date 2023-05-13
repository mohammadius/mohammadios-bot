import winston from "winston";
import { SeqTransport } from "@datalust/winston-seq";

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
			apiKey: "2P86Z6dw0Tl6sJX2vqMt",
			onError: (e) => {
				console.error(e);
			},
			handleExceptions: true,
			handleRejections: true
		})
	]
});
