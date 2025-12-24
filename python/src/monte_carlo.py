import argparse

def run_monte_carlo(run_id):
    print(f"[Python] Running Monte Carlo for {run_id}...")
    # Real logic: Read trades_v2.csv, shuffle returns 10k times, compute VaR
    print("[Python] Monte Carlo Report Generated (Mock)")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--run-id", required=True)
    args = parser.parse_args()
    run_monte_carlo(args.run_id)
