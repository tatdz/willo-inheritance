import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { apiRequest } from "@/lib/queryClient";
import { uploadToIPFS } from "@/lib/web3-utils";
import { 
  FileText, 
  Shield, 
  Handshake, 
  Upload, 
  Plus,
  Trash2,
  Eye,
  CloudUpload,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import type { Document as DocumentType, Vault } from "@shared/schema";

const documentSchema = z.object({
  vaultId: z.number(),
  title: z.string().min(1, "Document title is required"),
  type: z.enum(['will', 'power_of_attorney', 'trust', 'death_certificate', 'probate', 'other']),
  description: z.string().optional(),
  ipfsHash: z.string().min(1, "File must be uploaded"),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
});

type DocumentForm = z.infer<typeof documentSchema>;

const DOCUMENT_TYPES = [
  { 
    id: 'will', 
    name: 'Digital Will', 
    icon: FileText, 
    description: 'Your digital last will and testament',
    color: 'text-blue-600'
  },
  { 
    id: 'power_of_attorney', 
    name: 'Power of Attorney', 
    icon: Shield, 
    description: 'Legal authority documents',
    color: 'text-green-600'
  },
  { 
    id: 'trust', 
    name: 'Trust Agreements', 
    icon: Handshake, 
    description: 'Trust and estate documents',
    color: 'text-purple-600'
  },
  { 
    id: 'death_certificate', 
    name: 'Death Certificate', 
    icon: FileText, 
    description: 'Legal proof for inheritance claims',
    color: 'text-gray-600'
  },
  { 
    id: 'probate', 
    name: 'Probate Letters', 
    icon: FileText, 
    description: 'Court authorization documents',
    color: 'text-orange-600'
  },
  { 
    id: 'other', 
    name: 'Other Legal Documents', 
    icon: FileText, 
    description: 'Additional legal declarations',
    color: 'text-gray-500'
  },
];

export default function Documents() {
  const [selectedVaultId, setSelectedVaultId] = useState<number | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { wallet } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vaults = [] } = useQuery({
    queryKey: ['/api/vaults'],
    enabled: wallet.isConnected,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['/api/documents', selectedVaultId],
    queryFn: () => selectedVaultId ? 
      fetch(`/api/vaults/${selectedVaultId}/documents`).then(r => r.json()) : 
      [],
    enabled: !!selectedVaultId,
  });

  const form = useForm<DocumentForm>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: '',
      type: 'will',
      description: '',
      ipfsHash: '',
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async (data: DocumentForm) => {
      const response = await apiRequest('POST', `/api/vaults/${data.vaultId}/documents`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: "Document Uploaded",
        description: "Document has been securely stored on IPFS and registered on-chain.",
      });
      setIsUploadDialogOpen(false);
      form.reset();
      setUploadedFile(null);
      setUploadProgress(0);
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: number) => {
      await apiRequest('DELETE', `/api/documents/${documentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({
        title: "Document Removed",
        description: "Document has been removed from the vault.",
      });
    },
  });

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    setUploadedFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to IPFS
      const result = await uploadToIPFS(file);
      
      setUploadProgress(100);
      form.setValue('ipfsHash', result.hash);
      form.setValue('fileSize', file.size);
      form.setValue('mimeType', file.type);

      toast({
        title: "File Uploaded",
        description: "File has been uploaded to IPFS successfully.",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload file to IPFS. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: DocumentForm) => {
    if (!selectedVaultId) {
      toast({
        title: "No Vault Selected",
        description: "Please select a vault first.",
        variant: "destructive",
      });
      return;
    }

    uploadDocumentMutation.mutate({
      ...data,
      vaultId: selectedVaultId,
    });
  };

  const getDocumentTypeInfo = (type: string) => {
    return DOCUMENT_TYPES.find(t => t.id === type) || DOCUMENT_TYPES[5];
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!wallet.isConnected) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-gray-600 mb-6">
          Please connect your wallet to manage your legal documents.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Vault Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Vault</CardTitle>
          <p className="text-gray-600">Choose which vault to manage documents for</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vaults.map((vault: Vault) => (
              <Button
                key={vault.id}
                variant={selectedVaultId === vault.id ? "default" : "outline"}
                className="h-auto p-4 justify-start"
                onClick={() => setSelectedVaultId(vault.id)}
              >
                <div className="text-left">
                  <div className="font-medium">{vault.name}</div>
                  <div className="text-sm opacity-70">
                    {vault.description || 'No description'}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedVaultId && (
        <>
          {/* Document Categories */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Document Categories</CardTitle>
                <p className="text-gray-600">Secure storage for your inheritance-related legal documents</p>
              </div>
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Upload Legal Document</DialogTitle>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Drag & Drop Upload Area */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                        {!uploadedFile ? (
                          <>
                            <CloudUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                              Drop files here or click to browse
                            </h4>
                            <p className="text-gray-600 mb-4">
                              Supported formats: PDF, DOC, DOCX (Max 10MB)
                            </p>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                              className="hidden"
                              id="file-upload"
                            />
                            <Button 
                              type="button" 
                              onClick={() => document.getElementById('file-upload')?.click()}
                            >
                              Browse Files
                            </Button>
                          </>
                        ) : (
                          <div className="space-y-4">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                            <div>
                              <h4 className="font-medium text-gray-900">{uploadedFile.name}</h4>
                              <p className="text-sm text-gray-600">{formatFileSize(uploadedFile.size)}</p>
                            </div>
                            {isUploading && (
                              <div className="space-y-2">
                                <Progress value={uploadProgress} className="w-full" />
                                <p className="text-sm text-gray-600">
                                  Uploading to IPFS... {uploadProgress}%
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Document Title *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Last Will and Testament - 2024" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Document Type *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select document type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {DOCUMENT_TYPES.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Brief description of this document"
                                rows={3}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsUploadDialogOpen(false);
                            form.reset();
                            setUploadedFile(null);
                            setUploadProgress(0);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={uploadDocumentMutation.isPending || !form.watch('ipfsHash')}
                        >
                          {uploadDocumentMutation.isPending ? 'Uploading...' : 'Upload Document'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DOCUMENT_TYPES.map((type) => {
                  const typeDocuments = documents.filter((doc: DocumentType) => doc.type === type.id);
                  const IconComponent = type.icon;
                  
                  return (
                    <div key={type.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <IconComponent className={`h-6 w-6 mr-3 ${type.color}`} />
                        <h4 className="font-medium text-gray-900">{type.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                      <div className="space-y-2">
                        {typeDocuments.length > 0 ? (
                          typeDocuments.map((doc: DocumentType) => (
                            <div key={doc.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center text-green-600">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                <span className="truncate">{doc.title}</span>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">No documents uploaded</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Documents List */}
          <Card>
            <CardHeader>
              <CardTitle>All Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Documents Uploaded
                  </h3>
                  <p className="text-gray-600">
                    Upload your first legal document to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc: DocumentType) => {
                    const typeInfo = getDocumentTypeInfo(doc.type);
                    const IconComponent = typeInfo.icon;
                    
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <IconComponent className={`h-5 w-5 ${typeInfo.color}`} />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900">{doc.title}</h3>
                              <Badge variant="outline">
                                {typeInfo.name}
                              </Badge>
                            </div>
                            {doc.description && (
                              <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>IPFS: {doc.ipfsHash.substring(0, 12)}...</span>
                              {doc.fileSize && (
                                <span>Size: {formatFileSize(doc.fileSize)}</span>
                              )}
                              <span>
                                Uploaded: {new Date(doc.createdAt!).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteDocumentMutation.mutate(doc.id)}
                            disabled={deleteDocumentMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
