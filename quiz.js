class Quiz {
  constructor(questions) {
    this.questions = questions;
    this.score = 0;
    this.currentIndex = 0;
    this.isFinished = false;
  }

  getCurrentQuestion() {
    return this.questions[this.currentIndex];
  }

  answer(selectedOption) {
    if (this.isFinished) return;

    const currentQuestion = this.getCurrentQuestion();
    if (currentQuestion.answer === selectedOption) {
      this.score++;
    }

    this.currentIndex++;
    if (this.currentIndex >= this.questions.length) {
      this.isFinished = true;
    }
  }

  reset() {
    this.score = 0;
    this.currentIndex = 0;
    this.isFinished = false;
  }
}