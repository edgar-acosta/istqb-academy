import { Routes, Route } from "react-router";
import GuideLayout from "@/components/GuideLayout";
import Cover from "./pages/Cover";
import Contents from "./pages/Contents";
import ModulePage from "./pages/ModulePage";
import QuizPage from "./pages/QuizPage";
import GlossaryPage from "./pages/GlossaryPage";
import ReferencesPage from "./pages/ReferencesPage";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import LearningPage from "./pages/LearningPage";
import AttemptDetailPage from "./pages/AttemptDetailPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="*"
        element={
          <GuideLayout>
            <Routes>
              <Route path="/" element={<Cover />} />
              <Route path="/contenido" element={<Contents />} />
              <Route path="/modulo/:id" element={<ModulePage />} />
              <Route path="/evaluacion" element={<QuizPage />} />
              <Route path="/mi-aprendizaje" element={<LearningPage />} />
              <Route path="/mi-aprendizaje/evaluaciones/:id" element={<AttemptDetailPage />} />
              <Route path="/mi-aprendizaje/evaluaciones/historico/:id" element={<AttemptDetailPage legacy />} />
              <Route path="/glosario" element={<GlossaryPage />} />
              <Route path="/referencias" element={<ReferencesPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </GuideLayout>
        }
      />
    </Routes>
  );
}
