import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coordinates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coordinates.html',
  styleUrls: ['./coordinates.css']
})
export class Coordinates implements OnDestroy {
  size = 8;
  board: number[][] = Array.from({ length: this.size }, () => Array(this.size).fill(0));

  // Game state
  target = '';
  lastClick: { r: number; c: number; correct: boolean } | null = null;
  score = 0;
  attempts = 0;

  // Timer
  duration = 60; // seconds
  timeRemaining = this.duration;
  timerId: any = null;
  running = false;

  constructor() {
    this.nextTarget();
  }

  ngOnDestroy(): void {
    if (this.timerId) clearInterval(this.timerId);
  }

  fileLabel(index: number): string { return String.fromCharCode(97 + index); }
  rankLabel(row: number): number { return this.size - row; }

  toCoord(r: number, c: number): string {
    const file = String.fromCharCode(97 + c);
    const rank = this.size - r;
    return `${file}${rank}`;
  }

  randomTarget(): string {
    const r = Math.floor(Math.random() * this.size);
    const c = Math.floor(Math.random() * this.size);
    return this.toCoord(r, c);
  }

  nextTarget(): void {
    this.target = this.randomTarget();
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.timeRemaining = this.duration;
    this.score = 0;
    this.attempts = 0;
    this.lastClick = null;
    this.nextTarget();
    this.timerId = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.stop();
      }
    }, 1000);
  }

  stop(): void {
    this.running = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  reset(): void {
    this.stop();
    this.timeRemaining = this.duration;
    this.score = 0;
    this.attempts = 0;
    this.lastClick = null;
    this.nextTarget();
  }

  clickSquare(r: number, c: number): void {
    const coord = this.toCoord(r, c);
    const correct = coord.toLowerCase() === this.target.toLowerCase();
    this.lastClick = { r, c, correct };
    if (this.running) {
      this.attempts++;
      if (correct) {
        this.score++;
        this.nextTarget();
      }
    } else {
      // Practice mode (no timer): still advance on correct
      if (correct) {
        this.score++;
        this.attempts++;
        this.nextTarget();
      } else {
        this.attempts++;
      }
    }

    // Clear the lastClick highlight after a short delay
    setTimeout(() => {
      this.lastClick = null;
    }, 450);
  }

  get accuracy(): number {
    if (this.attempts === 0) return 0;
    return Math.round((this.score / this.attempts) * 100);
  }
}
