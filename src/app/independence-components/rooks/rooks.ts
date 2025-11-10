import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rooks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rooks.html',
  styleUrls: ['./rooks.css']
})
export class Rooks implements OnChanges {
  @Input() size = 8;
  board: number[][] = Array.from({ length: this.size }, () => Array(this.size).fill(0));
  rooksPlaced = 0;
  validRooksPlaced = 0;
  highlightPath = false;

  fileLabel(index: number): string { return String.fromCharCode(97 + index); }
  rankLabel(row: number): number { return this.size - row; }

  get threatenedSquares(): boolean[][] {
    const threatened = Array.from({ length: this.size }, () => Array(this.size).fill(false));
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.board[row][col] >= 1) {
          for (let i = 0; i < 8; i++) {
            threatened[row][i] = true;
            threatened[i][col] = true;
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
    return this.size;
  }

  get isSolved(): boolean {
    return this.validRooksPlaced === this.requiredPieces && this.rooksPlaced === this.requiredPieces;
  }

  resetBoard(): void {
    this.board = Array.from({ length: 8 }, () => Array(8).fill(0));
    this.rooksPlaced = 0;
    this.validRooksPlaced = 0;
  }

  placeRook(row: number, col: number): void {
    if (this.board[row][col] >= 1) {
      this.board[row][col] = 0;
      this.rooksPlaced--;
      this.recalculateValidPieces();
    } else {
      if (this.canPlace(row, col)) {
        this.board[row][col] = 1;
      } else {
        this.board[row][col] = 2;
      }
      this.rooksPlaced++;
      this.recalculateValidPieces();
    }
  }

  recalculateValidPieces(): void {
    this.validRooksPlaced = 0;
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.board[row][col] >= 1) {
          if (this.isPieceValid(row, col)) {
            this.board[row][col] = 1;
            this.validRooksPlaced++;
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
    
    let valid = true;
    for (let i = 0; i < this.size; i++) {
      if (this.board[row][i] >= 1 || this.board[i][col] >= 1) {
        valid = false;
        break;
      }
    }
    
    this.board[row][col] = currentValue;
    return valid;
  }

  canPlace(row: number, col: number): boolean {
    for (let i = 0; i < this.size; i++) {
      if (this.board[row][i] === 1 || this.board[i][col] === 1) return false;
    }
    return true;
  }

  ngOnChanges(changes: SimpleChanges): void { if (changes['size']) this.resetBoard(); }
}
