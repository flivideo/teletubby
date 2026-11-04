#!/bin/sh
cd "$(dirname "$0")" && swiftc -O main.swift -o apple-stt -Xlinker -sectcreate -Xlinker __TEXT -Xlinker __info_plist -Xlinker Info.plist
