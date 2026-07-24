import React from 'react';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import { useStore } from './store/useStore';

// Step pages
import Step1Jira from './pages/Step1Jira';
import Step2Figma from './pages/Step2Figma';
import Step3Analysis from './pages/Step3Analysis';
import Step4Gaps from './pages/Step4Gaps';
import Step5TestCases from './pages/Step5TestCases';
import Step6Traceability from './pages/Step6Traceability';
import Step7Export from './pages/Step7Export';
import Step8Automation from './pages/Step8Automation';
import Step9TestData from './pages/Step9TestData';
import Step10CICD from './pages/Step10CICD';

const STEPS = [
  { id: 1, label: 'Jira Story', component: Step1Jira },
  { id: 2, label: 'Figma Design', component: Step2Figma },
  { id: 3, label: 'AI Analysis', component: Step3Analysis },
  { id: 4, label: 'Gap Analysis', component: Step4Gaps },
  { id: 5, label: 'Test Cases', component: Step5TestCases },
  { id: 6, label: 'Traceability', component: Step6Traceability },
  { id: 7, label: 'Export', component: Step7Export },
  { id: 8, label: 'Automation', component: Step8Automation },
  { id: 9, label: 'Test Data', component: Step9TestData },
  { id: 10, label: 'CI/CD', component: Step10CICD },
];

export default function App() {
  const currentStep = useStore(s => s.currentStep);
  const CurrentPage = STEPS.find(s => s.id === currentStep)?.component || Step1Jira;

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
        }}
      />
      <Layout steps={STEPS}>
        <CurrentPage />
      </Layout>
    </>
  );
}
