import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-eight-queens',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './eight-queens.html',
  styleUrls: ['./eight-queens.css']
})
export class EightQueens implements OnChanges {
  @Input() size = 8;
  board: number[][] = Array.from({ length: this.size }, () => Array(this.size).fill(0));
  queensPlaced = 0;
  validQueensPlaced = 0;

  navbarClosed = false;

  highlightPath = false;

  fileLabel(index: number): string { return String.fromCharCode(97 + index); }
  rankLabel(row: number): number { return this.size - row; }

  get threatenedSquares(): boolean[][] {
    const threatened = Array.from({ length: this.size }, () => Array(this.size).fill(false));
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.board[row][col] >= 1) {
          // Mark row and column
          for (let i = 0; i < this.size; i++) {
            threatened[row][i] = true;
            threatened[i][col] = true;
          }
          // Mark diagonals
          for (let i = -(this.size - 1); i <= (this.size - 1); i++) {
            if (row + i >= 0 && row + i < this.size && col + i >= 0 && col + i < this.size) {
              threatened[row + i][col + i] = true;
            }
            if (row + i >= 0 && row + i < this.size && col - i >= 0 && col - i < this.size) {
              threatened[row + i][col - i] = true;
            }
          }
        }
      }
    }
    // Don't highlight the queen's own square
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
    return this.validQueensPlaced === this.requiredPieces && this.queensPlaced === this.requiredPieces;
  }

  resetBoard(): void {
    this.board = Array.from({ length: this.size }, () => Array(this.size).fill(0));
    this.queensPlaced = 0;
    this.validQueensPlaced = 0;
  }

  placeQueen(row: number, col: number): void {
    if (this.board[row][col] >= 1) {
      // Remove piece
      this.board[row][col] = 0;
      this.queensPlaced--;
      this.recalculateValidPieces();
    } else {
      // Place piece - mark as valid (1) or invalid (2)
      if (this.canPlace(row, col)) {
        this.board[row][col] = 1; // Valid placement
      } else {
        this.board[row][col] = 2; // Invalid placement (on attacked square)
      }
      this.queensPlaced++;
      this.recalculateValidPieces();
    }
  }

  recalculateValidPieces(): void {
    this.validQueensPlaced = 0;
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.board[row][col] >= 1) {
          // Check if this piece is in a valid position
          if (this.isPieceValid(row, col)) {
            this.board[row][col] = 1;
            this.validQueensPlaced++;
          } else {
            this.board[row][col] = 2;
          }
        }
      }
    }
  }

  isPieceValid(row: number, col: number): boolean {
    // Temporarily remove this piece to check if it's being attacked
    const currentValue = this.board[row][col];
    this.board[row][col] = 0;
    
    let valid = true;
    // Check column and row
    for (let i = 0; i < this.size; i++) {
      if (this.board[row][i] >= 1 || this.board[i][col] >= 1) {
        valid = false;
        break;
      }
    }
    
    // Check diagonals if still valid
    if (valid) {
      for (let i = -(this.size - 1); i <= (this.size - 1); i++) {
        if (
          row + i >= 0 && row + i < this.size && col + i >= 0 && col + i < this.size && this.board[row + i][col + i] >= 1
        ) {
          valid = false;
          break;
        }
        if (
          row + i >= 0 && row + i < this.size && col - i >= 0 && col - i < this.size && this.board[row + i][col - i] >= 1
        ) {
          valid = false;
          break;
        }
      }
    }
    
    this.board[row][col] = currentValue;
    return valid;
  }

  canPlace(row: number, col: number): boolean {
    // Check column and row
    for (let i = 0; i < this.size; i++) {
      if (this.board[row][i] === 1 || this.board[i][col] === 1) return false;
    }
    // Check diagonals
    for (let i = -(this.size - 1); i <= (this.size - 1); i++) {
      if (
        row + i >= 0 && row + i < this.size && col + i >= 0 && col + i < this.size && this.board[row + i][col + i] === 1
      ) return false;
      if (
        row + i >= 0 && row + i < this.size && col - i >= 0 && col - i < this.size && this.board[row + i][col - i] === 1
      ) return false;
    }
    return true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['size']) this.resetBoard();
  }
}
