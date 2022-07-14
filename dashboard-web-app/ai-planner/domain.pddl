; PDDL Domain Description for moving authorities units between different locations to tackle weather events there

(define (domain domain_name)

    ;remove requirements that are not needed
    (:requirements :strips :fluents :durative-actions :timed-initial-literals :typing :conditional-effects :negative-preconditions :duration-inequalities :equality)

    (:types
        location unit fuelandequipment weathereventtype weathereventrisk - object
        policecar firetruck ambulance - unit
    )

    ; un-comment following line if constants are needed
    ;(:constants )

    (:predicates
        (is-hub ?l - location)
        (is-weatherevent-at ?w - weathereventtype ?l - location)
        (is-unit-at ?u - unit ?l - location)
        (needs-police-car-in-case-of ?w - weathereventtype ?l - location)
        (needs-fire-truck-in-case-of ?w - weathereventtype ?l - location)
        (needs-ambulance-in-case-of ?w - weathereventtype ?l - location)
        (refilling-fuel-and-equipment ?fae1 - fuelandequipment ?fae2 - fuelandequipment)
    )

    (:functions
        (current-risk ?w - weathereventtype ?l - location)
        (current-fuel-and-equipment-level ?u - unit)
        (fuel-needed-for-move ?l1 - location ?l2 - location)
    )
    ; TODO actions: move, refillAndReEquip, alertLocalsByLight, alertLocalsBySound, counterMeasureDriveUpProtectionWall, counterMeasureLockDownLocation
    ; moving a unit of correct type to a location with a fitting weather event should decrease current-risk for the event at the location (but: nonlinear so 1 unit makes more difference than 1+1 units)
    ; maybe only allow each unit moving once so it does not go back and forth.
    ; problem how to reward units already positioned at a weather event location?
)