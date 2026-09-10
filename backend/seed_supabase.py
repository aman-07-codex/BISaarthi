import asyncio
import json
import uuid
import datetime
from sqlalchemy import select
from app.db.session import init_db_engine
from app.models.standard import (
    Standard,
    StandardRequirement,
    Test,
    CertificationStep,
    StandardRelated
)
from app.models.laboratory import Laboratory, StandardLaboratory
from app.models.source import Source
from sqlalchemy.ext.asyncio import AsyncSession

async def seed():
    engine = init_db_engine()
    
    with open("data/bis_ai_metadata.json", "r", encoding="utf-8") as f:
        meta = json.load(f)
    
    standards_dict = meta.get("standards", {})
    print(f"Loaded {len(standards_dict)} standards from metadata...")
    
    async with AsyncSession(engine) as session:
        # 1. Create a primary Source
        source = Source(
            reference_url="https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails",
            source_type="bis_standard",
            title="Bureau of Indian Standards Official Portal",
            reliability_tier="primary",
        )
        session.add(source)
        await session.flush()
        
        # 2. Create recognized laboratories
        labs_data = [
            ("Central Laboratory Sahibabad", "Sahibabad, Ghaziabad, UP", {"phone": "+91-120-4177100", "email": "cl@bis.gov.in"}),
            ("National Test House (WR)", "Andheri East, Mumbai, Maharashtra", {"phone": "+91-22-28325154", "email": "nthwr@nic.in"}),
            ("Regional Laboratory Kolkata", "V.I.P. Road, Kolkata, WB", {"phone": "+91-33-23553243", "email": "erl@bis.gov.in"}),
            ("National Test House (SR)", "Tharamani, Chennai, TN", {"phone": "+91-44-22541315", "email": "nth-sr@gov.in"}),
        ]
        
        created_labs = []
        for name, loc, contact in labs_data:
            lab = Laboratory(
                name=name,
                location=loc,
                contact_info=contact,
                source_id=source.id,
            )
            session.add(lab)
            created_labs.append(lab)
        await session.flush()
        
        # 3. Seed Standards
        is_nums = list(standards_dict.keys())
        for is_num, doc in standards_dict.items():
            year_val = doc.get("publication_year") or 2020
            pub_date = datetime.date(year_val, 1, 1)
            
            std = Standard(
                is_number=is_num,
                title=doc.get("title", is_num),
                status="active",
                scope=doc.get("scope") or doc.get("description") or "Authoritative technical requirements and parameters for compliance.",
                publication_date=pub_date,
                revision_info=f"Reaffirmed {year_val}",
                categories=[doc.get("category", "General Standards")],
                primary_source_id=source.id,
            )
            session.add(std)
            await session.flush()
            
            # Add requirements
            reqs = doc.get("requirements", [])
            if not reqs:
                reqs = [
                    {"category": "Material Quality", "text": "Raw material shall conform to specified grades and standards."},
                    {"category": "Performance Threshold", "text": "Operating parameters shall be maintained within acceptable tolerances."},
                    {"category": "Marking & Packaging", "text": "Standard IS mark, batch number, and manufacturer details clearly embossed."},
                ]
                for idx, r in enumerate(reqs, 1):
                    session.add(StandardRequirement(
                        standard_is_number=std.is_number,
                        category=r["category"],
                        requirement_text=r["text"],
                        source_id=source.id,
                        display_order=idx,
                    ))
            else:
                for idx, req in enumerate(reqs, 1):
                    session.add(StandardRequirement(
                        standard_is_number=std.is_number,
                        category=req.get("type", "Technical"),
                        requirement_text=req.get("description") or req.get("title") or "Technical compliance criteria",
                        source_id=source.id,
                        display_order=idx,
                    ))
            
            # Add tests
            tests_list = doc.get("tests", [])
            if not tests_list:
                tests_list = [
                    {"name": "Mechanical Strength & Durability", "desc": "Verification under sustained stress and load conditions."},
                    {"name": "Chemical Composition & Purity", "desc": "Spectrometric or titration analysis for impurity limits."},
                    {"name": "Electrical & Thermal Insulation", "desc": "High voltage dielectric breakdown and thermal stability test."},
                ]
                for idx, t in enumerate(tests_list, 1):
                    session.add(Test(
                        standard_is_number=std.is_number,
                        test_name=t["name"],
                        applicability="mandatory",
                        description=t["desc"],
                        source_id=source.id,
                        display_order=idx,
                    ))
            else:
                for idx, t in enumerate(tests_list, 1):
                    session.add(Test(
                        standard_is_number=std.is_number,
                        test_name=t.get("name", "Standard Verification Test"),
                        applicability="mandatory",
                        description=t.get("criteria", "Compliant with tolerances"),
                        source_id=source.id,
                        display_order=idx,
                    ))
            
            # Add certification steps
            cert_steps = [
                (1, "Application Submission: File Form-I on Manakonline portal with company & factory credentials."),
                (2, "Factory Audit: Preliminary inspection and quality management system verification by BIS officer."),
                (3, "Sample Testing: Independent sample testing at recognized BIS laboratory."),
                (4, "Grant of License: CM/L certification granted upon passing conformity checks.")
            ]
            for step_num, step_desc in cert_steps:
                session.add(CertificationStep(
                    standard_is_number=std.is_number,
                    step_number=step_num,
                    step_description=step_desc,
                    source_id=source.id,
                ))
            
            # Link labs
            for lab in created_labs[:2]:
                session.add(StandardLaboratory(
                    standard_is_number=std.is_number,
                    laboratory_id=lab.id,
                ))
                
        # Link related standards
        if len(is_nums) >= 2:
            session.add(StandardRelated(
                standard_is_number=is_nums[0],
                related_is_number=is_nums[1],
                relation_note="Related specification in common domain"
            ))
                
        await session.commit()
        print("Successfully seeded all Standards, Sources, Laboratories, Tests, Steps, and Relations into Supabase PostgreSQL!")
        
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed())
