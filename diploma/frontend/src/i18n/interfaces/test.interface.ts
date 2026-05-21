export interface ITestTranslations {
  title: string;
  subtitle: string;
  loading: string;
  errors: {
    loadQuestions: string;
    answerRequired: string;
    unansweredQuestions: string;
    calculationError: string;
  };
  success: {
    resultsReady: string;
  };
  progress: {
    question: string;
  };
  hints: {
    multipleChoice: string;
  };
  buttons: {
    previous: string;
    next: string;
    finish: string;
    restart: string;
  };
  results: {
    allDirections: string;
    recommendations: string;
  };
}
