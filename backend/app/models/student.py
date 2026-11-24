"""Student profile model (API input, validated server-side)."""
from enum import Enum

from pydantic import BaseModel, Field


class Gender(str, Enum):
    FEMALE = "female"
    MALE = "male"
    UNSPECIFIED = "unspecified"  # "Prefer not to say"


class StudentProfile(BaseModel):
    cgpa: float = Field(..., ge=0.0, le=4.0,
                        description="Student CGPA on the dataset's 4.00 scale")
    department: str = Field(..., min_length=1, description="Student department, e.g. CSE")
    financial_support_needed: bool = Field(..., description="Whether the student needs financial support")
    gender: Gender = Field(default=Gender.UNSPECIFIED,
                           description="Used only because the dataset contains gender-restricted scholarships")
    lang: str = Field(default="en", pattern="^(en|bn)$",
                      description="Explanation language: 'en' or 'bn'")
