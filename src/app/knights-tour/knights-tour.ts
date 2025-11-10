import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Square {
  visited: boolean;
  order: number;
}

@Component({
  selector: 'app-knights-tour',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './knights-tour.html',
  styleUrls: ['./knights-tour.css']
})
export class KnightsTour {
  size = 8;
  board: Square[][] = [];
  knightPosition: { row: number; col: number } | null = null;
  moveCount = 0;
  gameStarted = false;

  // Knight moves: L-shape (2 squares in one direction, 1 in perpendicular)
  private readonly knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];

  constructor() {
    this.initializeBoard();
  }

  initializeBoard(): void {
    this.board = Array.from({ length: this.size }, () =>
      Array.from({ length: this.size }, () => ({
        visited: false,
        order: 0
      }))
    );
    this.knightPosition = null;
    this.moveCount = 0;
    this.gameStarted = false;
  }

  fileLabel(index: number): string {
    return String.fromCharCode(97 + index); // a-h
  }

  rankLabel(row: number): number {
    return this.size - row; // 8-1
  }

  isLightSquare(row: number, col: number): boolean {
    return (row + col) % 2 === 0;
  }

  isValidMove(row: number, col: number): boolean {
    // Check bounds
    if (row < 0 || row >= this.size || col < 0 || col >= this.size) {
      return false;
    }

    // Square must not be visited
    if (this.board[row][col].visited) {
      return false;
    }

    // If no knight placed yet, any square is valid
    if (!this.knightPosition) {
      return true;
    }

    // Check if it's a valid knight move (L-shape)
    const rowDiff = Math.abs(row - this.knightPosition.row);
    const colDiff = Math.abs(col - this.knightPosition.col);

    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  }

  getValidMoves(): { row: number; col: number }[] {
    if (!this.knightPosition) {
      return [];
    }

    const validMoves: { row: number; col: number }[] = [];

    for (const [dr, dc] of this.knightMoves) {
      const newRow = this.knightPosition.row + dr;
      const newCol = this.knightPosition.col + dc;

      if (this.isValidMove(newRow, newCol)) {
        validMoves.push({ row: newRow, col: newCol });
      }
    }

    return validMoves;
  }

  isValidMoveSquare(row: number, col: number): boolean {
    if (!this.gameStarted) return false;
    return this.getValidMoves().some(move => move.row === row && move.col === col);
  }

  clickSquare(row: number, col: number): void {
    if (!this.isValidMove(row, col)) {
      return;
    }

    // Place knight and mark as visited
    this.knightPosition = { row, col };
    this.moveCount++;
    this.board[row][col].visited = true;
    this.board[row][col].order = this.moveCount;
    this.gameStarted = true;
  }

  reset(): void {
    this.initializeBoard();
  }

  get isComplete(): boolean {
    return this.moveCount === this.size * this.size;
  }

  get squaresVisited(): number {
    return this.moveCount;
  }

  get totalSquares(): number {
    return this.size * this.size;
  }

  get hasValidMoves(): boolean {
    if (!this.knightPosition) return true;
    return this.getValidMoves().length > 0;
  }

  get isStuck(): boolean {
    return this.gameStarted && !this.isComplete && !this.hasValidMoves;
  }
}
