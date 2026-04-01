#!/bin/bash

# Configuration
FILE="history.txt"

# Check if file exists
if [ ! -f "$FILE" ]; then
    echo "Error: $FILE does not exist."
    exit 1
fi

while true; do
    echo -e "\n--- SNAKE STACK ADMIN MENU ---"
    echo "1) View Recent Games (Paginated)"
    echo "2) View Analytics (Mean Score/Time)"
    echo "3) Delete Entries (by Username)"
    echo "4) Log Rotation (Backup & Keep Last 10)"
    echo "5) View Sorted (by Score)"
    echo "6) Exit"
    read -p "Select an option: " choice

    case $choice in
        1)
            # Paginated view using less
            cat "$FILE" | less
            ;;
        2)
            # Analytics using awk
            echo "--- Analytics ---"
            awk -F'|' '{
                split($2, stats, " ");
                sum_score += stats[1];
                sum_time += stats[3];
                count++;
                if(stats[2] == "WALL") wall_deaths++;
            } END {
                if(count > 0)
                    printf "Mean Score: %.2f\nMean Time: %.2f s\nWall Death Fraction: %.2f\n", sum_score/count, sum_time/count, wall_deaths/count;
                else print "No data available.";
            }' "$FILE"
            ;;
        3)
            # Delete using sed with confirmation
            read -p "Enter username to delete: " uname
            read -p "Are you sure? (y/n): " confirm
            if [ "$confirm" == "y" ]; then
                sed -i "/|.*$uname/!{/\<$uname\>/d}" "$FILE" # Precise matching
                echo "Entries for $uname deleted."
            fi
            ;;
        4)
            # Log rotation using tar and tail
            TIMESTAMP=$(date +%Y%m%d_%H%M%S)
            tar -czf "history_backup_$TIMESTAMP.tar.gz" "$FILE"
            tail -n 10 "$FILE" > temp.txt && mv temp.txt "$FILE"
            echo "Rotation complete. Backup created and file truncated to last 10 entries."
            ;;
        5)
            # Sort by score (the second field)
            sort -t'|' -k2 -rn "$FILE" | less
            ;;
        6)
            exit 0
            ;;
        *)
            echo "Invalid choice."
            ;;
    esac
done
