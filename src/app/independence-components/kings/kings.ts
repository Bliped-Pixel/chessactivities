import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-kings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kings.html',
  styleUrls: ['./kings.css']
})
export class Kings implements OnChanges {
  @Input() size = 8;
  board: number[][] = Array.from({ length: this.size }, () => Array(this.size).fill(0));
  kingsPlaced = 0;
  validKingsPlaced = 0;
  highlightPath = false;

  fileLabel(index: number): string { return String.fromCharCode(97 + index); }
  rankLabel(row: number): number { return this.size - row; }

  get threatenedSquares(): boolean[][] {
    const threatened = Array.from({ length: this.size }, () => Array(this.size).fill(false));
    const moves = [
      [1, 0], [0, 1], [-1, 0], [0, -1],
      [1, 1], [-1, -1], [1, -1], [-1, 1]
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
    // Winning counts: 4=4, 5=9, 6=9, 7=16, 8=16
    switch (this.size) {
      case 4: return 4;
      case 5: return 9;
      case 6: return 9;
      case 7: return 16;
      case 8: return 16;
      default: return this.size * 2;
    }
  }

  get isSolved(): boolean {
    return this.validKingsPlaced === this.requiredPieces && this.kingsPlaced === this.requiredPieces;
  }

  resetBoard(): void {
    this.board = Array.from({ length: this.size }, () => Array(this.size).fill(0));
    this.kingsPlaced = 0;
    this.validKingsPlaced = 0;
  }

  placeKing(row: number, col: number): void {
    if (this.board[row][col] >= 1) {
      this.board[row][col] = 0;
      this.kingsPlaced--;
      this.recalculateValidPieces();
    } else {
      if (this.canPlace(row, col)) {
        this.board[row][col] = 1;
      } else {
        this.board[row][col] = 2;
      }
      this.kingsPlaced++;
      this.recalculateValidPieces();
    }
  }

  recalculateValidPieces(): void {
    this.validKingsPlaced = 0;
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.board[row][col] >= 1) {
          if (this.isPieceValid(row, col)) {
            this.board[row][col] = 1;
            this.validKingsPlaced++;
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
      [1, 0], [0, 1], [-1, 0], [0, -1],
      [1, 1], [-1, -1], [1, -1], [-1, 1]
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
      [1, 0], [0, 1], [-1, 0], [0, -1],
      [1, 1], [-1, -1], [1, -1], [-1, 1]
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['size']) this.resetBoard();
  }
}
