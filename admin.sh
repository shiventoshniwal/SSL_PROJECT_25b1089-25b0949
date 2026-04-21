#!/bin/bash

# Configuration
FILE="history.txt"

# Check if file exists
if [ ! -f "$FILE" ]; then
    echo "Error: $FILE does not exist."
    exit 1
fi
#Check if file empty
if [[ $(grep -Ev "^$" "$FILE"|wc -l) -eq 0 ]];then
    echo "history.txt is empty"
    exit 0
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
                if(stats[2] == "WALL"){ wall_deaths++;}
                else { self_deaths++; }
            } END {
                if(count > 0)
                    printf "Mean Score: %.2f\nMean Time: %.2f s\nWall Death Fraction: %.2f\nSelf Death Fraction: %.2f\n", sum_score/count, sum_time/count, wall_deaths/count, self_deaths/count;
                else print "No data available.";
            }' "$FILE"
            ;;
        3)
            # Delete using sed with confirmation
            read -p "Enter username to delete: " uname
            if [[ $(grep -E $uname "$FILE"|wc -l) -eq 0 ]]; then
            echo "Invalid username"
            else
            read -p "Are you sure? (y/n): " confirm
            if [ "$confirm" == "y" ]; then
            sed "/ ${uname} /d" "$FILE">temp.txt
            cp temp.txt "$FILE"
            rm -r temp.txt
            echo "Entries for $uname deleted."
            elif [ "$confirm" != "n" ]; then
            echo "invalid option"
            fi
            fi
            ;;

        4)
            # Log rotation using tar and tail
            TIMESTAMP=$(date +%Y%m%d_%H%M%S)
            tar -czf "history_backup_$TIMESTAMP.tar.gz" "$FILE"
            tail -n 10 "$FILE" > temp.txt && mv temp.txt "$FILE"
            echo "Rotation complete. Backup created and file truncated to last 10 entries."
            ;;
        5)  # Sort by username or score
            read -p "Sort by username(u) or by score(s)?" x
            if [ "$x" == "s" ]; then
            sort -t '|' -k 2  -rn "$FILE" | less
            elif [ "$x" == "u" ];then
            sort -t ']' -k 2  "$FILE" | less
            else
            echo "Invalid option"
            fi
            ;;
        6)
            exit 0
            ;;
        *)
            echo "Invalid choice."
            ;;
    esac
done
