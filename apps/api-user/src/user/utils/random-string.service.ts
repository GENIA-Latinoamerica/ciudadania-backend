import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto'; // Import crypto module

@Injectable()
export class RandomStringService {
  // Method 1: Using crypto (recommended for secure randomness)
  generateRandomStringCrypto(length: number = 8): string {
    return crypto
      .randomBytes(length)
      .toString('base64')
      .replace(/[+/=]/g, '') // Remove non-uppercase characters
      .slice(0, length) // Limit the length
      .toUpperCase(); // Ensure uppercase letters
  }

  // Method 2: Using Math.random() (simpler method)
  generateRandomStringMath(length: number = 8): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // Uppercase letters only
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
  }

  generateRandomNumberMath(length: number = 8): string {
    const characters = '1234567890'; // Uppercase letters only
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
  }
}
