from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, white
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
import io

BG       = HexColor("#FFFFFF")
SURFACE  = HexColor("#F8F9FA")
BORDER   = HexColor("#E5E7EB")
TEXT     = HexColor("#111827")
MUTED    = HexColor("#6B7280")
GREEN    = HexColor("#16A34A")
RED      = HexColor("#DC2626")
YELLOW   = HexColor("#D97706")
BLUE     = HexColor("#2563EB")
VERDICT_COLORS = {
    "proceed": GREEN,
    "pivot":   YELLOW,
    "kill":    RED,
}
VERDICT_LABELS = {
    "proceed": "PROCEED",
    "pivot":   "PIVOT",
    "kill":    "KILL IT",
}

def fmt(n):
    if n >= 1000000:
        return f"${n/1000000:.1f}M"
    return f"${n/1000:.0f}K"

def generate_pdf(report: dict, idea: str) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=2*cm,
        rightMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm,
        title="FounderForge War Room Report"
    )

    styles = getSampleStyleSheet()
    W = A4[0] - 4*cm

    def style(name, **kwargs):
        kwargs.setdefault("textColor", TEXT)
        kwargs.setdefault("fontName", "Helvetica")
        return ParagraphStyle(name, **kwargs)

    title_style    = style("title",    fontSize=16, textColor=HexColor("#111827"),  spaceAfter=4,  fontName="Helvetica-Bold")
    subtitle_style = style("subtitle", fontSize=11, textColor=MUTED,  spaceAfter=16)
    label_style    = style("label",    fontSize=8,  textColor=MUTED,  spaceAfter=6,  fontName="Helvetica-Bold")
    body_style     = style("body",     fontSize=10, textColor=TEXT,   spaceAfter=6,  leading=16)
    bold_style     = style("bold",     fontSize=10, textColor=HexColor("#111827"),  spaceAfter=4,  fontName="Helvetica-Bold")
    small_style    = style("small",    fontSize=9,  textColor=MUTED,  spaceAfter=4)
    verdict_color  = VERDICT_COLORS.get(report["verdict"], BLUE)
    verdict_label  = VERDICT_LABELS.get(report["verdict"], "UNKNOWN")

    story = []

    # ── Header ──────────────────────────────────────────────────
    header_data = [[
        Paragraph("FounderForge War Room Report", title_style),
        Paragraph(f'<font color="#{verdict_color.hexval()[2:]}"><b>{verdict_label}</b></font><br/><font size="9" color="#6b7280">{report["confidence"]}% confidence</font>', 
                  ParagraphStyle("vh", fontName="Helvetica-Bold", fontSize=16, textColor=verdict_color, alignment=TA_RIGHT))
    ]]
    header_table = Table(header_data, colWidths=[W*0.65, W*0.35])
    header_table.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("BOTTOMPADDING", (0,0), (-1,-1), 12),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width=W, color=BORDER, thickness=1))
    story.append(Spacer(1, 12))

    # ── Idea box ─────────────────────────────────────────────────
    idea_data = [[Paragraph(f'<b><font color="#6b7280">STARTUP IDEA</font></b><br/>{idea}', body_style)]]
    idea_table = Table(idea_data, colWidths=[W])
    idea_table.setStyle(TableStyle([
        ("BACKGROUND",   (0,0), (-1,-1), SURFACE),
        ("ROUNDEDCORNERS", (0,0), (-1,-1), [6,6,6,6]),
        ("TOPPADDING",   (0,0), (-1,-1), 10),
        ("BOTTOMPADDING",(0,0), (-1,-1), 10),
        ("LEFTPADDING",  (0,0), (-1,-1), 14),
        ("RIGHTPADDING", (0,0), (-1,-1), 14),
    ]))
    story.append(idea_table)
    story.append(Spacer(1, 16))

    # ── Executive Summary ────────────────────────────────────────
    story.append(Paragraph("EXECUTIVE SUMMARY", label_style))
    story.append(HRFlowable(width=W, color=BORDER, thickness=0.5))
    story.append(Spacer(1, 6))
    story.append(Paragraph(report["executive_summary"], body_style))
    story.append(Spacer(1, 16))

    # ── Consensus + Disagreements ────────────────────────────────
    consensus_text    = "<br/>".join(f'<font color="#22c55e">✓</font>  {p}' for p in report["consensus"])
    disagreement_text = "<br/>".join(f'<font color="#ef4444">✕</font>  {p}' for p in report["key_disagreements"])
    cd_data = [[
        [Paragraph("WHAT AGENTS AGREED ON", label_style), Paragraph(consensus_text, body_style)],
        [Paragraph("KEY DISAGREEMENTS",     label_style), Paragraph(disagreement_text, body_style)],
    ]]
    cd_table = Table(cd_data, colWidths=[W*0.5-6, W*0.5-6], spaceBefore=0)
    cd_table.setStyle(TableStyle([
        ("VALIGN",       (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING",  (0,0), (-1,-1), 0),
        ("RIGHTPADDING", (0,0), (-1,-1), 0),
    ]))
    story.append(cd_table)
    story.append(Spacer(1, 16))

    # ── SWOT ─────────────────────────────────────────────────────
    story.append(Paragraph("SWOT ANALYSIS", label_style))
    story.append(HRFlowable(width=W, color=BORDER, thickness=0.5))
    story.append(Spacer(1, 8))

    swot_colors = {
        "strengths":     HexColor("#DCFCE7"),
        "weaknesses":    HexColor("#FEE2E2"),
        "opportunities": HexColor("#DBEAFE"),
        "threats":       HexColor("#FEF9C3"),
    }
    swot_labels = {
        "strengths": "STRENGTHS", "weaknesses": "WEAKNESSES",
        "opportunities": "OPPORTUNITIES", "threats": "THREATS"
    }
    swot_keys = ["strengths", "weaknesses", "opportunities", "threats"]

    def swot_cell(key):
        items = "<br/>".join(f"• {item}" for item in report["swot"][key])
        return [
            Paragraph(swot_labels[key], ParagraphStyle("sl", fontName="Helvetica-Bold", fontSize=8, textColor=MUTED, spaceAfter=4)),
            Paragraph(items, ParagraphStyle("si", fontName="Helvetica", fontSize=9, textColor=TEXT, leading=14))
        ]

    swot_data = [[swot_cell("strengths"), swot_cell("weaknesses")],
                 [swot_cell("opportunities"), swot_cell("threats")]]
    swot_table = Table(swot_data, colWidths=[W*0.5-4, W*0.5-4])
    swot_table.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (0,0), swot_colors["strengths"]),
        ("BACKGROUND",    (1,0), (1,0), swot_colors["weaknesses"]),
        ("BACKGROUND",    (0,1), (0,1), swot_colors["opportunities"]),
        ("BACKGROUND",    (1,1), (1,1), swot_colors["threats"]),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
        ("TOPPADDING",    (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ("LEFTPADDING",   (0,0), (-1,-1), 10),
        ("RIGHTPADDING",  (0,0), (-1,-1), 10),
        ("GRID",          (0,0), (-1,-1), 0.5, BORDER),
    ]))
    story.append(swot_table)
    story.append(Spacer(1, 16))

    # ── GTM ──────────────────────────────────────────────────────
    story.append(Paragraph("GO-TO-MARKET STRATEGY", label_style))
    story.append(HRFlowable(width=W, color=BORDER, thickness=0.5))
    story.append(Spacer(1, 6))
    story.append(Paragraph(f'Primary channel: <b>{report["gtm"]["primary_channel"]}</b>', body_style))
    for i, step in enumerate(report["gtm"]["ninety_day_plan"]):
        step_data = [[
            Paragraph(str(i+1), ParagraphStyle("sn", fontName="Helvetica-Bold", fontSize=9, textColor=BLUE, alignment=TA_CENTER)),
            Paragraph(step, body_style)
        ]]
        step_table = Table(step_data, colWidths=[0.7*cm, W-0.7*cm])
        step_table.setStyle(TableStyle([
            ("VALIGN",       (0,0), (-1,-1), "TOP"),
            ("LEFTPADDING",  (0,0), (-1,-1), 4),
            ("RIGHTPADDING", (0,0), (-1,-1), 0),
            ("TOPPADDING",   (0,0), (-1,-1), 0),
            ("BOTTOMPADDING",(0,0), (-1,-1), 4),
        ]))
        story.append(step_table)
    story.append(Spacer(1, 16))

    # ── Financials ───────────────────────────────────────────────
    story.append(Paragraph("FINANCIAL PROJECTIONS", label_style))
    story.append(HRFlowable(width=W, color=BORDER, thickness=0.5))
    story.append(Spacer(1, 8))
    fin = report["financials"]
    fin_data = [[
        [Paragraph("YEAR 1 REVENUE", ParagraphStyle("fl", fontName="Helvetica", fontSize=8, textColor=MUTED, alignment=TA_CENTER)),
         Paragraph(fmt(fin["year1_revenue"]), ParagraphStyle("fv", fontName="Helvetica-Bold", fontSize=16, textColor=HexColor("#111827"), alignment=TA_CENTER))],
        [Paragraph("YEAR 2 REVENUE", ParagraphStyle("fl2", fontName="Helvetica", fontSize=8, textColor=MUTED, alignment=TA_CENTER)),
         Paragraph(fmt(fin["year2_revenue"]), ParagraphStyle("fv2", fontName="Helvetica-Bold", fontSize=16, textColor=HexColor("#111827"), alignment=TA_CENTER))],
        [Paragraph("YEAR 3 REVENUE", ParagraphStyle("fl3", fontName="Helvetica", fontSize=8, textColor=MUTED, alignment=TA_CENTER)),
         Paragraph(fmt(fin["year3_revenue"]), ParagraphStyle("fv3", fontName="Helvetica-Bold", fontSize=16, textColor=HexColor("#111827"), alignment=TA_CENTER))],
        [Paragraph("BREAK-EVEN", ParagraphStyle("fl4", fontName="Helvetica", fontSize=8, textColor=MUTED, alignment=TA_CENTER)),
         Paragraph(f'Month {fin["break_even_month"]}', ParagraphStyle("fv4", fontName="Helvetica-Bold", fontSize=16, textColor=HexColor("#111827"), alignment=TA_CENTER))],
    ]]
    fin_table = Table(fin_data, colWidths=[W/4]*4)
    fin_table.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), SURFACE),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING",    (0,0), (-1,-1), 12),
        ("BOTTOMPADDING", (0,0), (-1,-1), 12),
        ("GRID",          (0,0), (-1,-1), 0.5, BORDER),
    ]))
    story.append(fin_table)
    story.append(Spacer(1, 16))

    # ── Risk Register ────────────────────────────────────────────
    story.append(Paragraph("RISK REGISTER", label_style))
    story.append(HRFlowable(width=W, color=BORDER, thickness=0.5))
    story.append(Spacer(1, 8))
    sev_colors = {"high": RED, "medium": YELLOW, "low": MUTED}
    for risk in report["risks"]:
        sc = sev_colors.get(risk["severity"], MUTED)
        risk_data = [[
            [Paragraph(risk["risk"], bold_style),
             Paragraph(f'Mitigation: {risk["mitigation"]}', small_style)],
            Paragraph(f'<b>{risk["severity"].upper()}</b>',
                      ParagraphStyle("sev", fontName="Helvetica-Bold", fontSize=9, textColor=sc, alignment=TA_RIGHT))
        ]]
        risk_table = Table(risk_data, colWidths=[W*0.8, W*0.2])
        risk_table.setStyle(TableStyle([
            ("BACKGROUND",    (0,0), (-1,-1), SURFACE),
            ("VALIGN",        (0,0), (-1,-1), "TOP"),
            ("TOPPADDING",    (0,0), (-1,-1), 10),
            ("BOTTOMPADDING", (0,0), (-1,-1), 10),
            ("LEFTPADDING",   (0,0), (-1,-1), 12),
            ("RIGHTPADDING",  (0,0), (-1,-1), 12),
            ("LINEBELOW",     (0,0), (-1,-1), 0.5, BORDER),
        ]))
        story.append(risk_table)
    story.append(Spacer(1, 16))

    # ── Final Recommendation ─────────────────────────────────────
    story.append(Paragraph("FINAL RECOMMENDATION", label_style))
    story.append(HRFlowable(width=W, color=BORDER, thickness=0.5))
    story.append(Spacer(1, 8))
    rec_data = [[Paragraph(report["final_recommendation"],
                            ParagraphStyle("rec", fontName="Helvetica-Bold", fontSize=11,
                                           textColor=verdict_color, leading=18))]]
    rec_table = Table(rec_data, colWidths=[W])
    rec_table.setStyle(TableStyle([
        ("LEFTPADDING",   (0,0), (-1,-1), 14),
        ("RIGHTPADDING",  (0,0), (-1,-1), 14),
        ("TOPPADDING",    (0,0), (-1,-1), 12),
        ("BOTTOMPADDING", (0,0), (-1,-1), 12),
        ("LINEAFTER",     (0,0), (0,-1), 3, verdict_color),
        ("BACKGROUND",    (0,0), (-1,-1), SURFACE),
    ]))
    story.append(rec_table)
    story.append(Spacer(1, 20))

    # ── Footer ───────────────────────────────────────────────────
    story.append(HRFlowable(width=W, color=BORDER, thickness=0.5))
    story.append(Spacer(1, 6))
    story.append(Paragraph("Generated by FounderForge — AI War Room for Startups",
                            ParagraphStyle("footer", fontName="Helvetica", fontSize=9,
                                           textColor=MUTED, alignment=TA_CENTER)))

    doc.build(story)
    return buffer.getvalue()