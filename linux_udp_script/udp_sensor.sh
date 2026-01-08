#!/usr/bin/env bash
export LC_NUMERIC=C

HOST="localhost"
PORT=6666
INTERVAL=1   # seconds between packets

temp=22.0        # °C
humidity=45.0    # %

clamp() {
    local val=$1 min=$2 max=$3
    awk -v v="$val" -v min="$min" -v max="$max" '
        BEGIN {
            if (v < min) print min;
            else if (v > max) print max;
            else print v;
        }'
}

while true; do
    temp_delta=$(awk 'BEGIN{srand(); printf "%.2f", (rand()-0.5)*0.4}')      # ±0.2°C
    hum_delta=$(awk 'BEGIN{srand(); printf "%.2f", (rand()-0.5)*2.0}')       # ±1.0%

    temp=$(awk -v t="$temp" -v d="$temp_delta" 'BEGIN{printf "%.2f", t+d}')
    humidity=$(awk -v h="$humidity" -v d="$hum_delta" 'BEGIN{printf "%.2f", h+d}')

    temp=$(clamp "$temp" 15.0 30.0)
    humidity=$(clamp "$humidity" 30.0 70.0)

    # Send JSON via UDP
    echo -n "{\"source\":\"udp\",\"temp\":$temp,\"humidity\":$humidity}" \
        >/dev/udp/$HOST/$PORT

    sleep "$INTERVAL"
done
