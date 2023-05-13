import fs from "fs/promises";

export const downloadImage = async (url: string, fileName: string) => {
	const { fileTypeFromBuffer } = await import("file-type");

	const res = await fetch(url);
	const buffer = await res.arrayBuffer();
	const fileType = await fileTypeFromBuffer(buffer);
	const imageFileName = fileName + "." + fileType!.ext;
	await fs.writeFile(imageFileName, Buffer.from(buffer));
	return imageFileName;
};

export function shellCommand(array: string[]) {
	if (array.length === 0) {
		return "";
	}

	return array
		.map((x) => x.replace(/"/gi, '\\"'))
		.map((x) => (x.includes(" ") ? `"${x}"` : x))
		.join(" ");
}
