import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  PlayCircle, 
  Clock, 
  Users, 
  Coins, 
  Image, 
  CheckCircle,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";

interface SimulationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  duration: number; // in seconds for demo
}

const SIMULATION_STEPS: SimulationStep[] = [
  {
    id: 'wallet-connect',
    title: 'Connect Demo Wallet',
    description: 'Connect CHZ wallet with 12,500 CHZ, fan tokens, and 4 NFTs',
    status: 'pending',
    duration: 2
  },
  {
    id: 'create-vault',
    title: 'Create Inheritance Vault',
    description: 'Set up vault with 365-day inactivity period',
    status: 'pending',
    duration: 3
  },
  {
    id: 'add-assets',
    title: 'Register Assets',
    description: 'Add CHZ tokens, BAR/PSG fan tokens, and sports NFTs',
    status: 'pending',
    duration: 4
  },
  {
    id: 'add-beneficiaries',
    title: 'Assign Beneficiaries',
    description: 'Configure inheritance rules for family members',
    status: 'pending',
    duration: 3
  },
  {
    id: 'add-guardians',
    title: 'Set Guardians',
    description: 'Designate trusted parties for claim verification',
    status: 'pending',
    duration: 2
  },
  {
    id: 'simulate-inactivity',
    title: 'Simulate Inactivity',
    description: 'Fast-forward 365 days of wallet inactivity',
    status: 'pending',
    duration: 5
  },
  {
    id: 'initiate-claim',
    title: 'Initiate Inheritance Claim',
    description: 'Beneficiary submits claim for assets',
    status: 'pending',
    duration: 3
  },
  {
    id: 'guardian-approval',
    title: 'Guardian Verification',
    description: 'Guardians review and approve the claim',
    status: 'pending',
    duration: 4
  },
  {
    id: 'asset-transfer',
    title: 'Execute Asset Transfer',
    description: 'Transfer CHZ tokens and NFTs to beneficiary',
    status: 'pending',
    duration: 3
  }
];

export function DemoSimulation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState(SIMULATION_STEPS);
  const { wallet } = useWallet();

  const startSimulation = async () => {
    setIsRunning(true);
    setCurrentStep(0);
    
    // Reset all steps
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
    
    // Run through each step
    for (let i = 0; i < SIMULATION_STEPS.length; i++) {
      setCurrentStep(i);
      
      // Mark current step as active
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index === i ? 'active' : index < i ? 'completed' : 'pending'
      })));
      
      // Wait for step duration
      await new Promise(resolve => setTimeout(resolve, SIMULATION_STEPS[i].duration * 1000));
      
      // Mark step as completed
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index <= i ? 'completed' : 'pending'
      })));
    }
    
    setIsRunning(false);
  };

  const getStepIcon = (step: SimulationStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'active':
        return <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default:
        return <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const progress = (steps.filter(s => s.status === 'completed').length / steps.length) * 100;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="h-6 w-6 text-blue-600" />
          CHZ Token & NFT Inheritance Simulation
        </CardTitle>
        <p className="text-gray-600">
          Complete demonstration of the digital inheritance process using Chiliz tokens and sports NFTs
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Demo Portfolio Overview */}
        {wallet.address === '0x742d35Cc6634C0532925a3b8D186Ad6c23F3B02e' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
            <div className="text-center">
              <Coins className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="font-semibold">12,500 CHZ</div>
              <div className="text-sm text-gray-600">+ 525 Fan Tokens</div>
            </div>
            <div className="text-center">
              <Image className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="font-semibold">4 NFTs</div>
              <div className="text-sm text-gray-600">Sports cards & passes</div>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="font-semibold">Family Setup</div>
              <div className="text-sm text-gray-600">2 beneficiaries, 3 guardians</div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Simulation Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Simulation Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                step.status === 'active' 
                  ? 'bg-blue-50 border-blue-200' 
                  : step.status === 'completed'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex-shrink-0">
                {getStepIcon(step)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{step.title}</h4>
                  {step.status === 'active' && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      In Progress
                    </Badge>
                  )}
                  {step.status === 'completed' && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Completed
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
              
              {step.status === 'active' && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Clock className="h-4 w-4" />
                  {step.duration}s
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4 pt-4 border-t">
          <Button
            onClick={startSimulation}
            disabled={isRunning || wallet.address !== '0x742d35Cc6634C0532925a3b8D186Ad6c23F3B02e'}
            className="px-8"
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Running Simulation...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Start Simulation
              </>
            )}
          </Button>
          
          {!wallet.isConnected && (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Connect demo wallet to run simulation</span>
            </div>
          )}
        </div>

        {/* Simulation Results */}
        {progress === 100 && !isRunning && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h4 className="font-medium text-green-800">Simulation Completed Successfully!</h4>
            </div>
            <p className="text-sm text-green-700 mb-3">
              All 12,500 CHZ tokens, 525 fan tokens, and 4 NFTs have been successfully transferred to beneficiaries according to the inheritance rules.
            </p>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-green-700 border-green-300">
                Assets Transferred
              </Badge>
              <Badge variant="outline" className="text-green-700 border-green-300">
                Guardians Verified
              </Badge>
              <Badge variant="outline" className="text-green-700 border-green-300">
                Blockchain Confirmed
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}