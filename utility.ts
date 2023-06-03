export async function downloadImage(url: string, fileName: string) {
	const { fileTypeFromBuffer } = await import("npm:file-type");

	const res = await fetch(url);
	const buffer = await res.arrayBuffer();
	const fileType = await fileTypeFromBuffer(buffer);
	const imageFileName = fileName + "." + fileType!.ext;
	await Deno.writeFile(imageFileName, new Uint8Array(buffer));
	return imageFileName;
}

export function notEmpty<T>(value: T): value is NonNullable<T> {
	return value !== null && value !== undefined;
}
