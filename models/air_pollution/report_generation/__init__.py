"""
Report Generation Package

Contains the lightweight Groq-based environmental intelligence report generator.
No LangChain dependencies — uses direct Groq REST API with automatic model fallback.
"""
from .report_generator_lite import generate_report, assemble_city_payload

__all__ = ["generate_report", "assemble_city_payload"]
