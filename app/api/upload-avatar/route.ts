import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId");

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${userId}-${Date.now()}${path.extname(file.name)}`;
    const relativePath = `/profiles/${fileName}`;
    const fullPath = path.join(process.cwd(), "public", relativePath);

    // Asegurar que la carpeta existe
    await fs.mkdir(path.join(process.cwd(), "public", "profiles"), { recursive: true });
    
    // Escribir archivo
    await fs.writeFile(fullPath, buffer);

    return NextResponse.json({ path: relativePath });
  } catch (err) {
    return NextResponse.json({ error: "Error uploading" }, { status: 500 });
  }
}