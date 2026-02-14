import React from "react";
import { Card } from "../../components/ui/Card";

const PolicyMaker = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-8">
      <Card className="glass-card p-10">
        <h1 className="text-3xl font-bold text-primary">
          Policy Maker Dashboard
        </h1>
      </Card>
    </div>
  );
};

export default PolicyMaker;
