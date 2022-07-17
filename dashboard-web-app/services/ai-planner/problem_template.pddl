(define (problem weather-events-action-planning)
    (:domain weather-events-action-planning)
    (:objects
        {{locations}} - location
        {{units}} - unit
        {{weatherEventTypes}} - weathereventtype
    )

    (:init
        ; Hub {{hub}}

        ; Units: Types  {{unitTypes}}

        ; Units: Positioning  {{unitPositions}}

        ; Weather Events  {{weatherEvents}}
    )

    (:goal
        (and
            ; All Units have to either perform actions at a Weather Event location or refuel and reequip at Hub {{goalUnitsPerformedActions}}

            ; Needs for Units due to current Weather Events {{goalUnitsAtLocations}}
        )
    )
)