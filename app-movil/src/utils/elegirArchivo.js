/**
 * @file elegirArchivo.js
 * @description Abre el selector de archivos del teléfono para elegir el comprobante de
 * la transferencia: una imagen JPG o PNG, o un PDF.
 *
 * No usa la cámara (decisión 3 de la Etapa 3): así la app no pide un permiso más, y
 * alcanza con la captura o el PDF que entrega la app del banco.
 */

import * as DocumentPicker from 'expo-document-picker'
import { ARCHIVO_COMPROBANTE } from '../config/institucion'

/**
 * @returns {Promise<{uri: string, name: string, mimeType?: string, size?: number} | null>}
 *   El archivo elegido, o null si el padre canceló.
 */
export async function elegirArchivo() {
  const resultado = await DocumentPicker.getDocumentAsync({
    type: Object.keys(ARCHIVO_COMPROBANTE.tipos),
    // NO se copia a la carpeta temporal. En Expo Go, el selector copia el archivo a una
    // carpeta que el módulo de archivos (expo-file-system) no deja leer: "Missing 'READ'
    // permission". Sin la copia, el selector devuelve el enlace que da Android a ese
    // archivo (content://…), con permiso de lectura para la app, y se lee directo de ahí.
    copyToCacheDirectory: false,
    multiple: false,
  })
  return resultado.canceled ? null : resultado.assets[0]
}
