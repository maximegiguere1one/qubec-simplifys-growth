import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Calculator } from "lucide-react";
export const ROICalculator = () => {
  const [hoursPerWeek, setHoursPerWeek] = useState([10]);
  const [hourlyRate, setHourlyRate] = useState([25]);
  const monthlyLoss = hoursPerWeek[0] * 4 * hourlyRate[0];
  const subscriptionCost = 297; // Prix estimé One Système
  const monthlySavings = monthlyLoss - subscriptionCost;
  const breakEvenHours = Math.ceil(subscriptionCost / (hourlyRate[0] * 4));
  return;
};