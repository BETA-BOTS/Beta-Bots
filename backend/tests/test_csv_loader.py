import pytest

from app.data.csv_loader import DatasetError, load_scholarships


def test_loads_all_136_records(dataset):
    assert len(dataset) == 136


def test_record_fields_mapped(dataset):
    first = dataset[0]
    assert first.id == "1"
    assert first.name == "Merit Excellence Award"
    assert first.provider == "Bayview University"
    assert first.minimum_cgpa == 3.8
    assert first.all_departments is True
    assert first.financial_need_rule == "not_required"
    assert first.gender_rule is None
    assert first.amount_bdt == 30000
    assert first.amount_display == "BDT 30,000"
    assert first.deadline.isoformat() == "2027-02-15"
    assert first.source_row == 2  # header is line 1


def test_semicolon_departments_split(by_name):
    s = by_name["Future Engineer Scholarship"]
    assert s.eligible_departments == ["CSE", "EEE", "CE"]
    assert s.all_departments is False


def test_missing_name_column_is_a_clear_data_error(tmp_path):
    bad = tmp_path / "bad.csv"
    bad.write_text("id,provider\n1,Someone\n", encoding="utf-8")
    with pytest.raises(DatasetError):
        load_scholarships(bad)


def test_missing_optional_amount_is_none_not_faked(tmp_path):
    csv_file = tmp_path / "partial.csv"
    csv_file.write_text(
        "id,name,provider,min_cgpa,department,need_based,gender,amount_bdt,deadline,description\n"
        "9,Partial Award,Org,3.0,All,no,All,,2027-01-01,Desc\n",
        encoding="utf-8",
    )
    records = load_scholarships(csv_file)
    assert len(records) == 1
    assert records[0].amount_bdt is None
    assert records[0].amount_display is None  # UI shows "Not provided..."
