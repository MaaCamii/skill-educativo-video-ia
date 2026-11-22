import { Config } from "@remotion/cli/config";

// Sobrescribe el MP4 de salida sin preguntar.
Config.setOverwriteOutput(true);
// Codec de video estándar para redes.
Config.setCodec("h264");
