(define (problem weather-events-action-planning)
    (:domain weather-events-action-planning)
    (:objects
        {{locations}} - location
        {{units}} - unit
        {{weathereventtypes} - weathereventtype
    )

    (:init
        ; Units: Types  {{unittypes}]

        ; Units: Positioning  {{unitlocations}}

        ; Hub  {{hub}}

        ; Weather Events  {{weatherevents}}
    )

    (:goal
        (and
            ; All Units have to either perform actions at a Weather Event location or refuel and reequip at Hub {{goal_unitsperformedactions}

            ; Needs for Units due to current Weather Events {{goal_unitsatlocations}}
        )
    )
)