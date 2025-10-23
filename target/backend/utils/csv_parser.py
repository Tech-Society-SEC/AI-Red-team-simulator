import pandas as pd
import io

def parse_transactions(file: bytes, user_id: str) -> list[dict]:
    """
    Parses a CSV file, validates columns, cleans and transforms data,
    and prepares it for insertion into the public.transactions table.
    """
    # 1. Read the CSV file from bytes
    try:
        df = pd.read_csv(io.BytesIO(file))
    except Exception as e:
        raise ValueError(f"Error reading CSV file: {e}")

    # 2. Schema Validation (Case-Insensitive Check and Mapping)
    # Normalize column names for flexible mapping
    col_map = {c.lower(): c for c in df.columns}
    
    # Required database columns and their expected CSV/mapped names
    required_db_cols = {
        'txn_date': ['date', 'txn_date'],
        'amount': ['amount'],
        'description': ['description', 'details'],
        'category': ['category'],
        'merchant': ['merchant', 'payee'],
        'type': ['type', 'txn_type']
    }

    # Find the matching column in the DataFrame for each required DB column
    db_to_df_map = {}
    for db_col, possible_csv_cols in required_db_cols.items():
        matched = False
        for csv_col in possible_csv_cols:
            if csv_col in col_map:
                # Use the original DataFrame column name
                db_to_df_map[db_col] = col_map[csv_col]
                matched = True
                break
        if not matched:
            raise ValueError(f"Missing required column for database field '{db_col}'. Must include one of: {', '.join(possible_csv_cols)}")
    
    # Select and rename columns to match the PostgreSQL schema
    df = df.rename(columns={v: k for k, v in db_to_df_map.items()})[list(required_db_cols.keys())]

    # 3. Data Cleaning and Transformation
    
    # Add the required 'user_id' column
    df['user_id'] = user_id
    
    # Date Transformation: Convert to SQL 'date' format (YYYY-MM-DD)
    try:
        # Use errors='coerce' to turn invalid dates into NaT (Not a Time)
        df['txn_date'] = pd.to_datetime(df['txn_date'], errors='coerce').dt.date
        if df['txn_date'].isnull().any():
             raise ValueError("One or more dates in the 'txn_date' column are invalid.")
    except Exception as e:
        raise ValueError(f"Error processing date column: {e}")
        
    # Amount Transformation: Ensure numeric(10,2) format
    # This cleans up currency symbols, thousands separators, etc.
    df['amount'] = pd.to_numeric(df['amount'].astype(str).str.replace(r'[$,]', '', regex=True), errors='coerce')
    if df['amount'].isnull().any():
        raise ValueError("One or more values in the 'amount' column are not valid numbers.")
        
    # Type Validation: Ensure 'credit' or 'debit' (case-insensitive)
    valid_types = {'credit', 'debit'}
    df['type'] = df['type'].astype(str).str.lower().str.strip()
    if not df['type'].isin(valid_types).all():
        raise ValueError(f"Transaction 'type' must be 'credit' or 'debit'. Invalid types found.")
        
    # 4. Final Output
    # Convert DataFrame to a list of dictionaries for Supabase bulk insert
    return df.to_dict(orient="records")