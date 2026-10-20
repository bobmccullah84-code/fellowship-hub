import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ProtectedRoute } from "@/lib/protected-route";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import TeachingsPage from "@/pages/teachings-page";
import CoursesPage from "@/pages/courses-page";
import ProjectsPage from "@/pages/projects-page";
import AboutPage from "@/pages/about-page";
import FellowshipPage from "@/pages/fellowship-page";
import AdminPage from "@/pages/admin-page";
import CourseDetailPage from "@/pages/course-detail-page";
import LessonViewerPage from "@/pages/lesson-viewer-page";
import FoundationsOutlinePage from "@/pages/foundations-outline-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/teachings" component={TeachingsPage} />
      <Route path="/courses" component={CoursesPage} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/course/:id" component={CourseDetailPage} />
      <Route path="/course/:courseId/lesson/:lessonId" component={LessonViewerPage} />
      <Route path="/foundations-outline" component={FoundationsOutlinePage} />
      <ProtectedRoute path="/fellowship" component={FellowshipPage} />
      <ProtectedRoute path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
