import { EmailDiagnostic } from "@/components/EmailDiagnostic";
import { usePageTracking } from "@/hooks/usePageTracking";

const EmailDiagnosticPage = () => {
  usePageTracking();
  
  return (
    <div className="min-h-screen bg-gradient-background py-8">
      <div className="container mx-auto px-4">
        <EmailDiagnostic />
      </div>
    </div>
  );
};

export default EmailDiagnosticPage;