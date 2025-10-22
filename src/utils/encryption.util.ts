import { createCipheriv, createDecipheriv, randomBytes, scryptSync, CipherGCM, DecipherGCM } from 'crypto';

export class EncryptionUtil {
  private static algorithm = 'aes-256-gcm';
  private static key: Buffer;

  static initialize(encryptionKey: string) {
    this.key = scryptSync(encryptionKey, 'salt', 32);
  }

  static encrypt(text: string): string {
    if (!text) return text;

    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.key, iv) as CipherGCM;
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  static decrypt(encrypted: string): string {
    if (!encrypted) return encrypted;

    try {
      const [ivHex, authTagHex, encryptedHex] = encrypted.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const encryptedText = Buffer.from(encryptedHex, 'hex');

      const decipher = createDecipheriv(this.algorithm, this.key, iv) as DecipherGCM;
      decipher.setAuthTag(authTag);

      return Buffer.concat([decipher.update(encryptedText), decipher.final()]).toString('utf8');
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }
}
