import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth, IDiary } from "@/context/AuthContext";
import { BookMarked } from "lucide-react";

const RecentEntries: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [diaries, setDiaries] = useState<IDiary[]>([]);

  useEffect(() => {
    if (user?.diaries && user.diaries.length > 0) {
      const sorted = [...user.diaries]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 3);
      setDiaries(sorted);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-12">
        <BookMarked className="w-12 h-12 text-muted-stardust/30 mx-auto mb-4" />
        <p className="font-garamond text-lg text-muted-stardust/60 italic">
          Sign in to begin your private journal
        </p>
      </div>
    );
  }

  if (diaries.length === 0) {
    return (
      <div className="text-center py-12">
        <BookMarked className="w-12 h-12 text-muted-stardust/30 mx-auto mb-4" />
        <p className="font-garamond text-lg text-muted-stardust/60 italic">
          No diaries yet. Begin your first private book.
        </p>
        <Button
          onClick={() => navigate('/profile?tab=write')}
          className="lunara-button mt-4 font-garamond"
        >
          Begin writing
        </Button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {diaries.map((diary) => (
        <Card
          key={diary.id}
          className="lunara-glass-card hover:shadow-lg transition-all duration-300 cursor-pointer group"
          onClick={() => navigate(`/profile?tab=write&diaryId=${diary.id}`)}
        >
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-inter text-muted-stardust">
                {new Date(diary.updatedAt).toLocaleDateString()}
              </p>
              {diary.mood && (
                <Badge variant="secondary" className="bg-lunara-blue/10 text-lunara-blue border-lunara-blue/20 font-garamond text-[10px]">
                  {diary.mood}
                </Badge>
              )}
            </div>

            <h3 className="text-xl font-garamond font-medium text-pearl-mist leading-tight group-hover:text-lunara-accent transition-colors">
              {diary.title || 'Untitled diary'}
            </h3>

            <p className="text-soft-gray font-garamond leading-relaxed text-sm line-clamp-2">
              {diary.excerpt || diary.content?.substring(0, 160)}...
            </p>

            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-inter text-muted-stardust">
                {diary.readTime || Math.ceil((diary.content?.split(/\s+/).length || 0) / 200)} min read
              </span>
              <span className="text-sm font-inter text-lunara-accent group-hover:underline">
                Open diary →
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RecentEntries;
