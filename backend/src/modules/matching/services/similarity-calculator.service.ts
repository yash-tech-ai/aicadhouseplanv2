import { Injectable } from '@nestjs/common';

@Injectable()
export class SimilarityCalculatorService {
  /**
   * Calculate numeric similarity between two values
   * Returns a score from 0-100
   * @param value1 First value
   * @param value2 Second value
   * @param tolerance Acceptable difference as a ratio (e.g., 0.2 = 20%)
   */
  numericSimilarity(value1: number, value2: number, tolerance: number = 0.2): number {
    if (value1 === value2) return 100;
    if (value1 === 0 && value2 === 0) return 100;
    if (value1 === 0 || value2 === 0) return 0;

    const avg = (value1 + value2) / 2;
    const diff = Math.abs(value1 - value2);
    const relativeDiff = diff / avg;

    if (relativeDiff <= tolerance) {
      // Within tolerance - scale from 80-100
      return 100 - (relativeDiff / tolerance) * 20;
    } else {
      // Outside tolerance - scale from 0-80
      const excessDiff = relativeDiff - tolerance;
      const score = 80 - Math.min(80, (excessDiff / (1 - tolerance)) * 80);
      return Math.max(0, score);
    }
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  stringSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 100;

    const distance = this.levenshteinDistance(
      str1.toLowerCase(),
      str2.toLowerCase(),
    );
    const maxLength = Math.max(str1.length, str2.length);

    if (maxLength === 0) return 100;

    return ((maxLength - distance) / maxLength) * 100;
  }

  /**
   * Calculate array similarity (Jaccard index)
   */
  arraySimilarity(arr1: any[], arr2: any[]): number {
    if (!arr1 || !arr2) return 0;
    if (arr1.length === 0 && arr2.length === 0) return 100;

    const set1 = new Set(arr1);
    const set2 = new Set(arr2);

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return (intersection.size / union.size) * 100;
  }

  /**
   * Cosine similarity for vectors
   */
  cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 0;

    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      mag1 += vec1[i] * vec1[i];
      mag2 += vec2[i] * vec2[i];
    }

    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);

    if (mag1 === 0 || mag2 === 0) return 0;

    return (dotProduct / (mag1 * mag2)) * 100;
  }

  /**
   * Levenshtein distance algorithm
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}
