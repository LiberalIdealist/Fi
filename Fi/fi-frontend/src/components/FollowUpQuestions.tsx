"use client";

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  Box, Button, FormControl, FormLabel, Heading, Text,
  Textarea, VStack, useToast, Spinner, Card, CardBody
} from '@chakra-ui/react';

interface FollowUpQuestionsProps {
  questions: string[];
  onComplete: (profile: any) => void;
}

const FollowUpQuestions = ({ questions, onComplete }: FollowUpQuestionsProps) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { user, getIdToken } = useAuth();
  const toast = useToast();

  const handleInputChange = (question: string, value: string) => {
    // Create a question ID by taking the first 6 words and making a slug
    const questionId = question
      .split(' ')
      .slice(0, 6)
      .join(' ')
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '_');
      
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to submit your responses",
        status: "error",
        duration: 5000,
      });
      return;
    }
    
    // Make sure all questions are answered
    if (Object.keys(answers).length < questions.length) {
      toast({
        title: "Incomplete",
        description: "Please answer all questions",
        status: "warning",
        duration: 5000,
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const token = await getIdToken();
      
      const response = await fetch('/api/chat/geminiAnalysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          action: 'processFollowUp',
          userId: user.uid,
          data: answers
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process follow-up responses');
      }
      
      toast({
        title: "Analysis Complete",
        description: "Your financial profile has been created",
        status: "success",
        duration: 5000,
      });
      
      // Pass the user profile to the parent component
      onComplete(data.userProfile);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit follow-up responses",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} width="100%" maxWidth="800px" mx="auto" p={4}>
      <VStack spacing={6} align="stretch">
        <Heading as="h2" size="xl">Additional Questions</Heading>
        <Text>To provide you with the most accurate financial analysis, please answer these follow-up questions:</Text>
        
        {questions.map((question, index) => {
          const questionId = question
            .split(' ')
            .slice(0, 6)
            .join(' ')
            .toLowerCase()
            .replace(/[^a-z0-9 ]/g, '')
            .replace(/\s+/g, '_');
            
          return (
            <Card key={index} variant="outline">
              <CardBody>
                <FormControl isRequired>
                  <FormLabel>{question}</FormLabel>
                  <Textarea
                    onChange={(e) => handleInputChange(question, e.target.value)}
                    value={answers[questionId] || ''}
                    placeholder="Your answer"
                    rows={3}
                  />
                </FormControl>
              </CardBody>
            </Card>
          );
        })}
        
        <Button type="submit" colorScheme="green" size="lg" isLoading={isLoading}>
          {isLoading ? <Spinner /> : 'Complete Financial Profile'}
        </Button>
      </VStack>
    </Box>
  );
};

export default FollowUpQuestions;