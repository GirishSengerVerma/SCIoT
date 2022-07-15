(define (problem weather-events-action-planning-example-1)
    (:domain weather-events-action-planning)
    (:objects
        skp svo smes hub - location
        pc1 pc2 ft1 ft2 a1 a2 - unit
        storm hailstorm thunderstorm flood cold heat wildfire earthquake badair - weathereventtype
    )

    (:init
        ; Units: Types
        (is-police-car pc1)
        (is-police-car pc2)
        (is-fire-truck ft1)
        (is-fire-truck ft2)
        (is-ambulance a1)
        (is-ambulance a2)

        ; Units: Positioning
        (is-unit-at pc1 hub)
        (is-unit-at pc2 hub)
        (is-unit-at ft1 hub)
        (is-unit-at ft2 hub)
        (is-unit-at a1 hub)
        (is-unit-at a2 hub)

        ; Hub
        (is-hub hub)

        ; SKP: Actuators
        (has-alarm-light-at skp)
        (has-alarm-sound-at skp)
        (can-lock-down-at skp)

        ; SKP: Enabled Actuators
        (alarm-light-enabled-at skp)

        ; SKP: Weather Event Needs By Type
        (needs-fire-truck-in-case-of storm skp)
        (needs-fire-truck-in-case-of hailstorm skp)
        (needs-fire-truck-in-case-of thunderstorm skp)
        (needs-fire-truck-in-case-of flood skp)
        (needs-fire-truck-in-case-of cold skp)
        (needs-fire-truck-in-case-of heat skp)
        (needs-fire-truck-in-case-of wildfire skp)
        (needs-police-car-in-case-of wildfire skp) ; Police needs to investigate cause of fire
        (needs-fire-truck-in-case-of earthquake skp)
        ; TODO

        ; SVO: Actuators
        (has-alarm-light-at svo)
        (can-lock-down-at svo)

        ; SVO: Enabled Actuators

        ; SVO: Weather Event Needs By Type
        (needs-police-car-in-case-of badair svo)
        (needs-fire-truck-in-case-of badair svo)
        (needs-ambulance-in-case-of badair svo)
        ; TODO

        ; SMES: Actuators
        (has-alarm-light-at smes)
        (can-lock-down-at smes)
        (has-water-protection-wall-at smes)

        ; SMES: Enabled Actuators

        ; SMES: Weather Event Needs By Type
        ; TODO

        ; Weather Events: Properties
        (is-related-to-water flood)

        ; Weather Events: Current Events & Risks
        (is-weatherevent-at wildfire smes)
        (= (current-risk wildfire smes) 4); = EXTREME
        (is-weatherevent-at badair svo)
        (= (current-risk badair svo) 3); = HIGH
    )

    (:goal
        (and
            (exists
                (?u - unit)
                (and
                    (is-unit-operating ?u)
                    (is-unit-at ?u smes)
                ))
            (exists
                (?u - unit)
                (and
                    (is-unit-operating ?u)
                    (is-unit-at ?u svo)
                ))
        )
    )

    (:metric minimize
        (+
            (* 10 (+
                    (current-risk wildfire smes)
                    (current-risk badair svo)
                ))
            (is-violated refuelAndReequipAtHub)
        )
    )

    ;un-comment the following line if metric is needed
    ;(:metric minimize (???))
    ; TODO Goal: 
    ;           minimize sum of all current risks (most important) and 
    ;           maximize sum of operated locations (less important) and

    ; TODO Subgoal (preference): units back at authorities hub

    ; TODO If at a location there is no weather event: deactivate alarm light and tone and lockdown again
)