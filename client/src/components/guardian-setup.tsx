import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Plus, 
  Trash2,
  Mail,
  Phone,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Guardian {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  walletAddress: string;
  status: 'pending' | 'verified' | 'active';
}

const DEMO_GUARDIANS: Guardian[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah@lawfirm-partners.com',
    phone: '+1-555-0123',
    relationship: 'Legal Advisor',
    walletAddress: '0x2345678901234567890123456789012345678901',
    status: 'verified'
  },
  {
    id: '2', 
    name: 'Mark Thompson',
    email: 'mark.thompson@trustadvisors.com',
    phone: '+1-555-0456',
    relationship: 'Financial Advisor',
    walletAddress: '0x3456789012345678901234567890123456789012',
    status: 'verified'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '+1-555-0789',
    relationship: 'Family Friend',
    walletAddress: '0x4567890123456789012345678901234567890123',
    status: 'pending'
  }
];

export function GuardianSetup() {
  const [guardians, setGuardians] = useState<Guardian[]>(DEMO_GUARDIANS);
  const [isAdding, setIsAdding] = useState(false);
  const [newGuardian, setNewGuardian] = useState<Partial<Guardian>>({});
  const { toast } = useToast();

  const addGuardian = () => {
    if (!newGuardian.name || !newGuardian.email) {
      toast({
        title: "Missing Information",
        description: "Please provide at least name and email for the guardian.",
        variant: "destructive"
      });
      return;
    }

    const guardian: Guardian = {
      id: Date.now().toString(),
      name: newGuardian.name || '',
      email: newGuardian.email || '',
      phone: newGuardian.phone || '',
      relationship: newGuardian.relationship || 'Guardian',
      walletAddress: newGuardian.walletAddress || '',
      status: 'pending'
    };

    setGuardians([...guardians, guardian]);
    setNewGuardian({});
    setIsAdding(false);
    
    toast({
      title: "Guardian Added",
      description: `${guardian.name} has been invited as a guardian.`,
    });
  };

  const removeGuardian = (id: string) => {
    setGuardians(guardians.filter(g => g.id !== id));
    toast({
      title: "Guardian Removed",
      description: "Guardian has been removed from the vault.",
    });
  };

  const sendInvitation = (guardian: Guardian) => {
    // Simulate sending invitation email
    toast({
      title: "Invitation Sent",
      description: `Guardian invitation sent to ${guardian.email}`,
    });
    
    // Update status to verified for demo
    setGuardians(prev => prev.map(g => 
      g.id === guardian.id ? { ...g, status: 'verified' } : g
    ));
  };

  const getStatusColor = (status: Guardian['status']) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: Guardian['status']) => {
    switch (status) {
      case 'verified': return 'Verified';
      case 'active': return 'Active';
      default: return 'Pending';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Guardian Setup
        </CardTitle>
        <p className="text-sm text-gray-600">
          Guardians verify inheritance claims before asset transfer. At least 2 of 3 guardians must approve each claim.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">


        {/* Existing Guardians */}
        <div className="space-y-4">
          <h4 className="font-medium">Configured Guardians</h4>
          {guardians.map((guardian) => (
            <div key={guardian.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h5 className="font-medium">{guardian.name}</h5>
                      <p className="text-sm text-gray-600">{guardian.relationship}</p>
                    </div>
                    <Badge variant="secondary" className={getStatusColor(guardian.status)}>
                      {getStatusText(guardian.status)}
                    </Badge>
                  </div>
                  
                  <div className="ml-13 space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{guardian.email}</span>
                    </div>
                    {guardian.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{guardian.phone}</span>
                      </div>
                    )}
                    {guardian.walletAddress && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                        <code className="text-xs">{guardian.walletAddress}</code>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {guardian.status === 'pending' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => sendInvitation(guardian)}
                    >
                      Send Invite
                    </Button>
                  )}
                  {guardian.status === 'verified' && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs">Ready</span>
                    </div>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => removeGuardian(guardian.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Guardian */}
        <div className="border-t pt-4">
          {!isAdding ? (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Guardian
            </Button>
          ) : (
            <div className="space-y-4 p-4 border border-dashed rounded-lg">
              <h4 className="font-medium">Add New Guardian</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Full Name"
                  value={newGuardian.name || ''}
                  onChange={(e) => setNewGuardian({...newGuardian, name: e.target.value})}
                />
                <Input
                  placeholder="Relationship (e.g., Legal Advisor)"
                  value={newGuardian.relationship || ''}
                  onChange={(e) => setNewGuardian({...newGuardian, relationship: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={newGuardian.email || ''}
                  onChange={(e) => setNewGuardian({...newGuardian, email: e.target.value})}
                />
                <Input
                  placeholder="Phone Number"
                  value={newGuardian.phone || ''}
                  onChange={(e) => setNewGuardian({...newGuardian, phone: e.target.value})}
                />
              </div>
              
              <Input
                placeholder="Wallet Address (optional)"
                value={newGuardian.walletAddress || ''}
                onChange={(e) => setNewGuardian({...newGuardian, walletAddress: e.target.value})}
                className="font-mono text-sm"
              />
              
              <div className="flex gap-2">
                <Button onClick={addGuardian}>Add Guardian</Button>
                <Button variant="outline" onClick={() => {
                  setIsAdding(false);
                  setNewGuardian({});
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Guardian Security Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Guardian Security</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Guardians receive email notifications for all inheritance claims</p>
            <p>• Each guardian must approve claims using their wallet signature</p>
            <p>• Guardian identities are verified through email and optional KYC</p>
            <p>• Emergency procedures available if guardians are unreachable</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}