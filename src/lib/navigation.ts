import { NavigateFunction } from 'react-router-dom';

// Navigation utilities to replace window.location usage
export class NavigationService {
  private static navigate: NavigateFunction | null = null;

  static setNavigate(navigate: NavigateFunction) {
    this.navigate = navigate;
  }

  static goTo(path: string) {
    if (this.navigate) {
      this.navigate(path);
    } else {
      // Fallback for when navigate is not available
      window.location.href = path;
    }
  }

  static goToBookCall() {
    this.goTo('/book-call');
  }

  static goToQuiz() {
    this.goTo('/quiz');
  }

  static goToVSL() {
    this.goTo('/vsl');
  }

  static goToLanding() {
    this.goTo('/');
  }
}

// Hook to initialize navigation
export const useNavigationSetup = (navigate: NavigateFunction) => {
  NavigationService.setNavigate(navigate);
};