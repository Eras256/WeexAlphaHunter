import polars as pl
import argparse
import os

def generate_features(run_id):
    print(f"[{run_id}] Generating Features with Polars...")
    # Mock generation
    df = pl.DataFrame({
        "timestamp": [1, 2, 3],
        "close": [100, 101, 102]
    })
    
    out_path = f"data/processed/features_{run_id}.parquet"
    print(f"Saving to {out_path}")
    # df.write_parquet(out_path)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--runId", type=str, required=True)
    args = parser.parse_args()
    generate_features(args.runId)
