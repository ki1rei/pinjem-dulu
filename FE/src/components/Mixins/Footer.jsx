const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
      © {year}. PinjemDulu – All Rights Reserved.
    </footer>
  );
};

export default Footer;
