﻿using System;
using System.Threading.Tasks;
using Cygni.Snake.Client.Communication;

namespace Cygni.Snake.Client
{
    public class ConsoleMapPrinter : IPrinter
    {
        public void Print(IPrintable printable)
        {
            Task.Run(() =>
            {
                lock (Console.Out)
                {
                    printable.Print();
                }
            });
        }
    }
}