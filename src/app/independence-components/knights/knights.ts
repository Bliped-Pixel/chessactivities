import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-knights',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './knights.html',
  styleUrls: ['./knights.css']
})
export class Knights implements OnChanges {
  @Input() size = 8;
  board: number[][] = Array.from({ length: this.size }, () => Array(this.size).fill(0));
  knightsPlaced = 0;
  validKnightsPlaced = 0;
  highlightPath = false;

  fileLabel(index: number): string { return String.fromCharCode(97 + index); }
  rankLabel(row: number): number { return this.size - row; }

  get threatenedSquares(): boolean[][] {
    const threatened = Array.from({ length: this.size }, () => Array(this.size).fill(false));
    const moves = [
      [2, 1], [1, 2], [-1, 2], [-2, 1],
      [-2, -1], [-1, -2], [1, -2], [2, -1]
    ];
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.board[row][col] >= 1) {
          for (const [dr, dc] of moves) {
            const nr = row + dr;
            const nc = col + dc;
            if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size) {
              threatened[nr][nc] = true;
            }
          }
        }
      }
    }
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.board[row][col] >= 1) threatened[row][col] = false;
      }
    }
    return threatened;
  }

  get requiredPieces(): number {
    // Winning counts: 4=8, 5=13, 6=18, 7=25, 8=32
    switch (this.size) {
      case 4: return 8;
      case 5: return 13;
      case 6: return 18;
      case 7: return 25;
      case 8: return 32;
      default: return Math.floor((this.size * this.size) / 2);
    }
  }

  get isSolved(): boolean {
    return this.validKnightsPlaced === this.requiredPieces && this.knightsPlaced === this.requiredPieces;
  }

  resetBoard(): void {
    this.board = Array.from({ length: this.size }, () => Array(this.size).fill(0));
    this.knightsPlaced = 0;
    this.validKnightsPlaced = 0;
  }

  placeKnight(row: number, col: number): void {
    if (this.board[row][col] >= 1) {
      this.board[row][col] = 0;
      this.knightsPlaced--;
      this.recalculateValidPieces();
    } else {
      if (this.canPlace(row, col)) {
        this.board[row][col] = 1;
      } else {
        this.board[row][col] = 2;
      }
      this.knightsPlaced++;
      this.recalculateValidPieces();
    }
  }

  recalculateValidPieces(): void {
    this.validKnightsPlaced = 0;
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.board[row][col] >= 1) {
          if (this.isPieceValid(row, col)) {
            this.board[row][col] = 1;
            this.validKnightsPlaced++;
          } else {
            this.board[row][col] = 2;
          }
        }
      }
    }
  }

  isPieceValid(row: number, col: number): boolean {
    const currentValue = this.board[row][col];
    this.board[row][col] = 0;
    
    const moves = [
      [2, 1], [1, 2], [-1, 2], [-2, 1],
      [-2, -1], [-1, -2], [1, -2], [2, -1]
    ];
    let valid = true;
    for (const [dr, dc] of moves) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size && this.board[nr][nc] >= 1) {
        valid = false;
        break;
      }
    }
    
    this.board[row][col] = currentValue;
    return valid;
  }

  canPlace(row: number, col: number): boolean {
    const moves = [
      [2, 1], [1, 2], [-1, 2], [-2, 1],
      [-2, -1], [-1, -2], [1, -2], [2, -1]
    ];
    for (const [dr, dc] of moves) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size && this.board[nr][nc] === 1) {
        return false;
      }
    }
    return true;
  }

  ngOnChanges(changes: SimpleChanges): void { if (changes['size']) this.resetBoard(); }
}
